import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Switch, FormControlLabel, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.style.backgroundColor = darkMode ? '#121212' : '#f7f7f7';
    document.body.style.color = darkMode ? '#fff' : '#000';
    window.dispatchEvent(new Event('darkModeChanged'));
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Settings</Typography>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={() => setDarkMode((prev) => !prev)} />}
            label={darkMode ? 'Dark Mode On' : 'Dark Mode Off'}
          />
          <Button variant="outlined" onClick={() => navigate('/change-password')}>Change Password</Button>
          <Button variant="contained" color="error" onClick={handleLogout}>Log Out</Button>
        </Paper>
      </Container>
    </AppShell>
  );
};

export default SettingsPage;
