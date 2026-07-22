import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { changePasswordUser } from '../services/api';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await changePasswordUser({ oldPassword, newPassword, confirmPassword });
      setMessage('Password changed successfully. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Schedula</Typography>
        <Typography variant="h6">Change Password</Typography>
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ width: '100%' }}>{message}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Current Password" type="password" fullWidth value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <TextField label="Confirm New Password" type="password" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" variant="contained" fullWidth size="large">Change Password</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChangePassword;
