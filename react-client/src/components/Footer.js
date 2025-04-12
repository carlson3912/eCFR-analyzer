import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ textAlign: 'center', p: 2, mt: 4, borderTop: '1px solid #ccc' }}>
      <Typography variant="body2">
        Project by Jack Carlson — <a href="mailto:jackacarlson3912@gmail.com">jackacarlson3912@gmail.com</a>
      </Typography>
    </Box>
  );
}