import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await registerUser({ name, email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">Schedula</Typography>
        <Typography variant="h6">Register</Typography>
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" fullWidth size="large">Register</Button>
          <Typography align="center">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;