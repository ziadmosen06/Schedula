import React, { useState } from 'react';
import { Container, Box, Typography, Button, TextField, Alert, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { updateProfileUser } from '../services/api';
import AppShell from '../components/AppShell';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const handleEdit = (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const update = async () => {
        const form = new FormData();
        form.append('name', name);
        if (selectedFile) form.append('photo', selectedFile);
        else form.append('photoUrl', photoUrl || '');

        const { data } = await updateProfileUser(form);
        updateUser(data);
        setMessage('Profile updated successfully.');
        setIsEditing(false);
      };
      update();
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  const [selectedFile, setSelectedFile] = React.useState(null);

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Profile</Typography>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar src={photoUrl || undefined} sx={{ width: 120, height: 120, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h6">{name || user?.name}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
          </Box>

          <Box component="form" onSubmit={handleEdit} sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
            <TextField label="Profile Picture URL" fullWidth value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} disabled={!isEditing} />
            {isEditing && (
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            )}
            {isEditing ? (
              <Button type="submit" variant="contained">Save Changes</Button>
            ) : (
              <Button variant="contained" onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </Box>
        </Box>
      </Container>
    </AppShell>
  );
};

export default ProfilePage;
