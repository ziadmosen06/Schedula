import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { resetPasswordUser } from '../services/api';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await resetPasswordUser({ email, otp, newPassword });
      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Schedula</Typography>
        <Typography variant="h6">Reset Password</Typography>
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ width: '100%' }}>{message}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="OTP" fullWidth value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Button type="submit" variant="contained" fullWidth size="large">Reset Password</Button>
          <Typography align="center">
            <Link to="/login">Back to login</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;
