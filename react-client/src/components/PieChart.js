import React from 'react';
import { Pie } from 'react-chartjs-2';
import titleData from '../title_stats.json';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip);

export default function TitleSizePieChart() {
  let grandTotalWords = 0;
  let grandTotalSections = 0;

  const getWordCount = (entry) => {
    let total = 0;

    const recurse = (node) => {
      if (node.word_count !== undefined) {
        total += node.word_count;
        grandTotalWords += node.word_count;
        grandTotalSections += node.section_count || 0;
      } else if (typeof node === 'object') {
        Object.values(node).forEach(recurse);
      }
    };

    recurse(entry);
    return total;
  };

  const titles = Object.keys(titleData);
  const wordCounts = titles.map((title) => getWordCount(titleData[title]));

  const chartData = {
    labels: titles,
    datasets: [
      {
        label: 'Word Count',
        data: wordCounts,
        backgroundColor: [
          '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#ff7043',
          '#26c6da', '#d4e157', '#5c6bc0', '#ec407a', '#8d6e63',
        ],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mt: 4, flexWrap: 'wrap' }}>
      <Box sx={{ maxWidth: 400 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Relative Size of Titles (by Word Count)
        </Typography>
        <Pie data={chartData} options={{ plugins: { legend: { display: false } } }} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
        <Box>
          <Typography variant="h3" fontWeight="bold">
            {grandTotalWords.toLocaleString()}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Total Words in CFR
          </Typography>
        </Box>

        <Box>
          <Typography variant="h3" fontWeight="bold">
            {grandTotalSections.toLocaleString()}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Total Sections in CFR
          </Typography>
        </Box>

        <Box>
          <Typography variant="h3" fontWeight="bold">
            316
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Number of Agencies
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
