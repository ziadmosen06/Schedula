import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { useAuth } from '../context/AuthContext';
import SidebarNavPanel from './SidebarNavPanel';

const AppShell = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [lazyMode, setLazyMode] = useState(() => localStorage.getItem('lazyMode') === 'true');

  useEffect(() => {
    const syncDarkMode = () => setDarkMode(localStorage.getItem('darkMode') === 'true');
    syncDarkMode();
    window.addEventListener('darkModeChanged', syncDarkMode);
    return () => window.removeEventListener('darkModeChanged', syncDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.style.backgroundColor = darkMode ? '#121212' : '#f7f7f7';
    document.body.style.color = darkMode ? '#fff' : '#000';
  }, [darkMode]);

  const toggleLazyMode = () => {
    const next = !lazyMode;
    setLazyMode(next);
    localStorage.setItem('lazyMode', next);
    window.dispatchEvent(new Event('lazyModeChanged'));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleMouseEnter = () => setDrawerOpen(true);
  const handleMouseLeave = () => setDrawerOpen(false);

  const handleSelectPanel = (panel) => {
    setDrawerOpen(false);
    if (panel === 'history') navigate('/history');
    else if (panel === 'streak') navigate('/streak');
    else if (panel === 'current') navigate('/current-tasks');
    else if (panel === 'home') navigate('/dashboard');
    else if (panel === 'calendar') navigate('/calendar');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: darkMode ? '#121212' : '#f7f7f7',
      color: darkMode ? '#fff' : '#000',
      '& .MuiPaper-root': {
        bgcolor: darkMode ? '#1e1e1e' : '#fff',
        color: darkMode ? '#fff' : '#000'
      },
      '& .MuiCard-root': {
        bgcolor: darkMode ? '#1e1e1e' : '#fff',
        color: darkMode ? '#fff' : '#000'
      },
      '& .MuiInputBase-root': {
        bgcolor: darkMode ? '#2a2a2a' : 'inherit',
        color: darkMode ? '#fff' : 'inherit'
      }
    }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="h6"
              sx={{ cursor: 'pointer', userSelect: 'none' }}
              ref={anchorRef}
              onMouseEnter={handleMouseEnter}
              onClick={() => navigate('/dashboard')}
            >
              Schedula
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title={lazyMode ? 'Lazy Mode ON — click to disable' : 'Enable Lazy Mode'} arrow>
              <IconButton
                color="inherit"
                onClick={toggleLazyMode}
                sx={{
                  bgcolor: lazyMode ? 'rgba(255,255,255,0.2)' : 'transparent',
                  borderRadius: 2,
                  transition: 'all 0.3s'
                }}
              >
                {lazyMode ? <WbSunnyIcon sx={{ color: '#ffd54f' }} /> : <BedtimeIcon />}
              </IconButton>
            </Tooltip>
            <Button color="inherit" onClick={() => navigate('/add-task')}>Add Task</Button>
            <Button color="inherit" onClick={() => navigate('/profile')}>Profile</Button>
            <IconButton color="inherit" onClick={() => navigate('/settings')} aria-label="settings">
              <SettingsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1 }}>{children}</Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          onMouseLeave: handleMouseLeave,
          sx: {
            bgcolor: darkMode ? '#1e1e1e' : '#fff',
            color: darkMode ? '#fff' : '#000'
          }
        }}
      >
        <SidebarNavPanel
          onClose={() => setDrawerOpen(false)}
          onSelect={handleSelectPanel}
          darkMode={darkMode}
        />
      </Drawer>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', borderTop: '1px solid #e0e0e0', bgcolor: darkMode ? '#1e1e1e' : 'white', color: darkMode ? '#fff' : '#000' }}>
        <Typography variant="body2" color="text.secondary">© 2026 Schedula. Stay organized.</Typography>
      </Box>
    </Box>
  );
};

export default AppShell;