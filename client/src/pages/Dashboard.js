import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button, TextField,
  Card, CardContent, CardActions, Chip, MenuItem,
  Select, FormControl, InputLabel, Alert, CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, deleteTask } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedHours, setEstimatedHours] = useState(1);

  useEffect(() => { // eslint-disable-next-line
    if (!user) return navigate('/login');
    fetchTasks();
  }, []); // eslint-disable-line

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createTask({ title, description, deadline, priority, estimatedHours });
      setTasks([...tasks, data]);
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setEstimatedHours(1);
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const priorityColor = { low: 'success', medium: 'warning', high: 'error', urgent: 'error' };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">Schedula</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Hi, {user?.name}</Typography>
            <Button variant="outlined" onClick={handleLogout}>Logout</Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleAddTask} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Typography variant="h6">Add New Task</Typography>
          <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Description" fullWidth multiline rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>Deadline</Typography>
           <TextField type="date" fullWidth value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
           </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Estimated Hours" type="number" fullWidth value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} inputProps={{ min: 1 }} />
          </Box>
          <Button type="submit" variant="contained" size="large">Add Task</Button>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Your Tasks</Typography>
        {loading ? (
          <CircularProgress />
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary">No tasks yet. Add one above!</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map(task => (
              <Card key={task._id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{task.title}</Typography>
                    <Chip label={task.priority} color={priorityColor[task.priority]} size="small" />
                  </Box>
                  {task.description && <Typography color="text.secondary" sx={{ mt: 1 }}>{task.description}</Typography>}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Estimated: {task.estimatedHours} hours
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="error" onClick={() => handleDelete(task._id)}>Delete</Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;