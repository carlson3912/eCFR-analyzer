import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import dogeLogo from '../doge_logo.jpg'; 

export default function Header({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="default" sx={{ bgcolor: 'background.default' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img src={dogeLogo} alt="Doge Logo" style={{ height: 48, marginRight: 12 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
              Department of Government Efficiency
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The people voted for major reform.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/search')}>
            Search Keywords
          </Button>
          <IconButton color="inherit" onClick={() => setDarkMode(prev => !prev)}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
