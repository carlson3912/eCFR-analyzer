import React, { useState } from 'react';
import agencySummary from '../agency_summary.json';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Paper, Collapse, TablePagination, Box, Typography,
  Dialog, DialogTitle, DialogContent, Card, CardContent, Button, Grid
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';

export default function AgencyTable() {
  const [expanded, setExpanded] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'words', direction: 'desc' });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogRefs, setDialogRefs] = useState([]);
  const [dialogAgency, setDialogAgency] = useState('');

  const data = Object.entries(agencySummary).map(([agency, stats]) => ({
    agency,
    words: stats.words,
    sections: stats.sections,
    children: stats.children || [],
    references: stats.references || []
  }));

  const toggleExpand = (agency) => {
    if (data.find((d) => d.agency === agency)?.children.length > 0) {
      setExpanded((prev) => ({ ...prev, [agency]: !prev[agency] }));
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    return typeof valA === 'string'
      ? sortConfig.direction === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
      : sortConfig.direction === 'asc'
      ? valA - valB
      : valB - valA;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const openReferenceDialog = (agency, refs) => {
    setDialogAgency(agency);
    setDialogRefs(refs);
    setOpenDialog(true);
  };

  const formatReference = (ref) => {
    const parts = [`Title ${ref.title}`];
    if (ref.subtitle) parts.push(`Subtitle ${ref.subtitle}`);
    if (ref.chapter) parts.push(`Chapter ${ref.chapter}`);
    if (ref.part) parts.push(`Part ${ref.part}`);
    return parts.join(' > ');
  };

  const generateCfrUrl = (ref) => {
    let url = `https://www.ecfr.gov/current/title-${ref.title}`;
    if (ref.subtitle) url += `/subtitle-${ref.subtitle}`;
    if (ref.chapter) url += `/chapter-${ref.chapter}`;
    if (ref.part) url += `/part-${ref.part}`;
    return url;
  };

  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto', px: 2 }}>
      <Typography variant="h5" sx={{ mt: 3 }}>
        Agency Regulation Statistics
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This table summarizes the number of words and sections found in the Code of Federal Regulations (CFR) for each agency.
        You can sort by agency name, word count, or section count. Click on an agency row to view its sub-agencies and their statistics.
        Each row also contains CFR references used to compute the totals.
      </Typography>

      <TablePagination
        component="div"
        count={sortedData.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '60px' }} />
              <TableCell
                onClick={() => handleSort('agency')}
                sx={{ width: '40%', cursor: 'pointer' }}
              >
                Agency {sortConfig.key === 'agency' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </TableCell>
              <TableCell
                onClick={() => handleSort('words')}
                sx={{ width: '15%', textAlign: 'right', cursor: 'pointer' }}
              >
                Words {sortConfig.key === 'words' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </TableCell>
              <TableCell
                onClick={() => handleSort('sections')}
                sx={{ width: '15%', textAlign: 'right', cursor: 'pointer' }}
              >
                Sections {sortConfig.key === 'sections' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </TableCell>
              <TableCell sx={{ width: '20%', textAlign: 'center' }}>
                CFR References
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row) => {
              const isExpandable = row.children.length > 0;
              const isOpen = expanded[row.agency];

              return (
                <React.Fragment key={row.agency}>
                  <TableRow
                    hover={isExpandable}
                    onClick={() => toggleExpand(row.agency)}
                    sx={{ height: 72, cursor: isExpandable ? 'pointer' : 'default' }}
                  >
                    <TableCell>
                      {isExpandable && (
                        <IconButton size="small">
                          {isOpen ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>{row.agency}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.words.toLocaleString()}</TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>{row.sections.toLocaleString()}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {row.references.length > 0 ? (
                        <Button size="small" onClick={(e) => {
                          e.stopPropagation();
                          openReferenceDialog(row.agency, row.references);
                        }}>
                          See {row.references.length} Reference{row.references.length > 1 ? 's' : ''}
                        </Button>
                      ) : '—'}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={5} sx={{ p: 0 }}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ overflowX: 'auto' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ width: '60px' }} />
                                <TableCell>Sub-Agency</TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>Words</TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>Sections</TableCell>
                                <TableCell />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {row.children.map((child, index) => (
                                <TableRow key={child.agency}>
                                  <TableCell />
                                  <TableCell sx={{ pl: 4, color: 'gray' }}>{index + 1}. {child.agency}</TableCell>
                                  <TableCell sx={{ textAlign: 'right' }}>{child.words.toLocaleString()}</TableCell>
                                  <TableCell sx={{ textAlign: 'right' }}>{child.sections.toLocaleString()}</TableCell>
                                  <TableCell />
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogAgency} - CFR References</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {dialogRefs.map((ref, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatReference(ref)}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      href={generateCfrUrl(ref)}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                    >
                      View on ecfr.gov
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
