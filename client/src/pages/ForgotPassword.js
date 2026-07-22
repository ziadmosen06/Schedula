import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { forgotPasswordUser, resetPasswordUser } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await forgotPasswordUser({ email });
      setOtpSent(true);
      setMessage('OTP sent. Enter the code and your new password below.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await resetPasswordUser({ email, otp, newPassword });
      setResetComplete(true);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setMessage('Password updated successfully. You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Schedula</Typography>
        <Typography variant="h6">Forgot Password</Typography>
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
        {message && <Alert severity={resetComplete ? 'success' : otpSent ? 'success' : 'info'} sx={{ width: '100%' }}>{message}</Alert>}

        {!resetComplete && (
          <>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" variant="contained" fullWidth size="large">Send OTP</Button>
            </Box>

            {otpSent && (
              <Box component="form" onSubmit={handleReset} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="OTP" fullWidth value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <Button type="submit" variant="contained" fullWidth size="large">Change Password</Button>
              </Box>
            )}
          </>
        )}

        <Typography align="center">
          <Link to="/login">Back to login</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
