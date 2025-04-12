import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  Autocomplete,
  Grid,
} from '@mui/material';
import CanvasJSReact from '@canvasjs/react-charts';
import slugs from '../agency_slugs.json';

const { CanvasJSChart } = CanvasJSReact;

export default function SearchPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [slug, setSlug] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [rates, setRates] = useState({ before: null, after: null });
  const [sleepMs, setSleepMs] = useState(500);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchDailyCounts = async (query) => {
    const res = await fetch(
      `https://www.ecfr.gov/api/search/v1/counts/daily?query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return Object.keys(data.dates || {});
  };

  const filterDatesToOnePerMonth = (dates) => {
    const seen = new Set();
    const filtered = [];

    for (const date of dates) {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(key)) {
        seen.add(key);
        filtered.push(date);
      }
    }

    return filtered;
  };

  const computeRate = (data) => {
    if (data.length < 2) return 0;
    const parse = (d) => new Date(d.date);
    const start = parse(data[0]);
    const end = parse(data[data.length - 1]);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months === 0) return 0;
    return ((data[data.length - 1].count - data[0].count) / months).toFixed(2);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setSubmittedKeyword(keyword);
    setLoading(true);
    setResults([]);
    setRates({ before: null, after: null });
    setProgress({ current: 0, total: 0 });

    try {
      const allDates = await fetchDailyCounts(keyword);

      const finalDates = allDates
        .filter((date) => {
          const d = new Date(date);
          const earliest = new Date('2017-01-01');
          const afterEarliest = d >= earliest;
          const afterStart = startDate ? d >= new Date(startDate) : true;
          const beforeEnd = endDate ? d <= new Date(endDate) : true;
          return afterEarliest && afterStart && beforeEnd;
        })
        .sort((a, b) => new Date(a) - new Date(b));

      const deduplicated = filterDatesToOnePerMonth(finalDates);
      setProgress({ current: 0, total: deduplicated.length });

      const output = [];
      for (let i = 0; i < deduplicated.length; i++) {
        const date = deduplicated[i];
        try {
          const url = `https://www.ecfr.gov/api/search/v1/count?query=${encodeURIComponent(keyword)}&date=${date}`
            + (slug ? `&agency_slugs[]=${encodeURIComponent(slug)}` : '');
          const res = await fetch(url);
          const data = await res.json();
          const count = data.meta?.total_count;
          if (typeof count === 'number') {
            output.push({ date, count });
          }
        } catch (err) {
          console.warn(`⚠️ Failed to fetch data for ${date}`, err);
        }
        setProgress({ current: i + 1, total: deduplicated.length });
        await sleep(sleepMs); 
      }

      const dogeDate = new Date('2025-01-20');
      const before = output.filter((d) => new Date(d.date) < dogeDate);
      const after = output.filter((d) => new Date(d.date) >= dogeDate);
      setRates({
        before: computeRate(before),
        after: computeRate(after),
      });

      setResults(output);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    animationEnabled: true,
    backgroundColor: isDarkMode ? '#121212' : '#ffffff',
    theme: isDarkMode ? 'dark2' : 'light2',
    title: {
      text: `Number of Regulations Mentioning ${submittedKeyword}`,
      fontColor: isDarkMode ? '#ffffff' : '#000000',
    },
    axisX: {
      title: 'Date',
      valueFormatString: 'YYYY-MM-DD',
      labelAngle: -45,
      labelFontColor: isDarkMode ? '#ccc' : '#333',
      titleFontColor: isDarkMode ? '#ccc' : '#333',
      stripLines: [
        {
          value: new Date('2025-01-20'),
          label: 'DOGE Founded',
          color: 'red',
          thickness: 2,
          labelFontColor: 'red',
          labelAlign: 'near',
          labelPlacement: 'outside',
        },
      ],
    },
    axisY: {
      title: 'Regulations',
      labelFontColor: isDarkMode ? '#ccc' : '#333',
      titleFontColor: isDarkMode ? '#ccc' : '#333',
    },
    data: [
      {
        type: 'line',
        color: isDarkMode ? '#90caf9' : '#2196f3',
        dataPoints: results.map((item) => ({
          x: new Date(item.date),
          y: item.count,
        })),
      },
    ],
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Search Keyword Mentions
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This tool allows you to track how frequently a specific keyword appears in the eCFR (Electronic Code of Federal Regulations) over time.
        You can optionally filter results by agency and by date range. Results are visualized month-by-month and reflect the number of regulations that mention the keyword.
        For performance reasons, results are limited to months where regulations containing the keyword were modified.
        The eCFR does not explicitly give a rate limit, so this program waits between API calls. You can adjust the delay below.
      </Typography>

      <TextField
        fullWidth
        required
        label="Keyword(s) -required"
        variant="outlined"
        margin="normal"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        error={!keyword.trim() && loading}
        helperText={
          (!keyword.trim() && loading
            ? "Keyword is required. "
            : "") +
          'Wrap your keyword in quotation marks (e.g., "carbon emissions") to find exact phrases. Without quotes, results include regulations containing all the words, regardless of order.'
        }
      />

      <Autocomplete
        options={slugs}
        value={slug}
        onChange={(event, newValue) => setSlug(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Agency Slug -optional"
            margin="normal"
            helperText="Choose an agency to limit the search to regulations issued by that agency. Leave blank to search across all agencies."
          />
        )}
        fullWidth
      />

      <TextField
        fullWidth
        label="Start Date (YYYY-MM-DD) -optional"
        variant="outlined"
        margin="normal"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <TextField
        fullWidth
        label="End Date (YYYY-MM-DD) -optional"
        variant="outlined"
        margin="normal"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <TextField
        fullWidth
        label="Delay Between API Calls (ms)"
        variant="outlined"
        margin="normal"
        type="number"
        value={sleepMs}
        onChange={(e) => setSleepMs(Number(e.target.value))}
        helperText="Adjust the delay between eCFR API requests. Increase this if you experience errors or rate limiting."
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Search'}
      </Button>

      {loading && (
        <Typography sx={{ mt: 2 }}>
          Fetching mentions: {progress.current} / {progress.total}
        </Typography>
      )}

      {submittedKeyword.trim() && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2">
            <a
              href={`https://www.ecfr.gov/search?search%5Bdate%5D=current&search%5Bquery%5D=${encodeURIComponent(submittedKeyword)}${slug ? `&search%5Bagency_slugs%5D%5B%5D=${encodeURIComponent(slug)}` : ''}&view=standard`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}
            >
              View current mentions of {submittedKeyword} on ecfr.gov →
            </a>
          </Typography>
        </Box>
      )}

      {results.length > 0 && (
        <>
          <Box sx={{ mt: 4 }}>
            <CanvasJSChart options={chartOptions} />
          </Box>

          <Grid container spacing={4} sx={{ mt: 5 }} justifyContent="center">
            <Grid item>
              <Typography variant="h4" align="center">
                {rates.before ?? '-'}
              </Typography>
              <Typography variant="body2" align="center">
                Monthly Rate Before DOGE
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h4" align="center">
                {rates.after ?? '-'}
              </Typography>
              <Typography variant="body2" align="center">
                Monthly Rate After DOGE
              </Typography>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
