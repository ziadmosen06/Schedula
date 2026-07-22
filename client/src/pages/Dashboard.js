import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Button,
  Card, CardContent, CardActions, Chip, Alert, CircularProgress,
  Stack, Paper, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getTasks, deleteTask, scheduleTask } from '../services/api';
import AppShell from '../components/AppShell';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lazyMode, setLazyMode] = useState(() => localStorage.getItem('lazyMode') === 'true');
  const [sortOrder, setSortOrder] = useState('priority-high');
  const [focusTime, setFocusTime] = useState(() => (localStorage.getItem('lazyMode') === 'true' ? 15 * 60 : 25 * 60));
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  useEffect(() => { // eslint-disable-next-line
    if (!user) return navigate('/login');
    fetchTasks();
  }, []); // eslint-disable-line

  useEffect(() => {
    const syncLazy = () => {
      const lazy = localStorage.getItem('lazyMode') === 'true';
      setLazyMode(lazy);
      setIsFocusRunning(false);
      setFocusTime(lazy ? 15 * 60 : 25 * 60);
    };
    window.addEventListener('lazyModeChanged', syncLazy);
    return () => window.removeEventListener('lazyModeChanged', syncLazy);
  }, []);

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

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleSchedule = async (id) => {
    try {
      const { data } = await scheduleTask(id);
      setTasks(tasks.map(task => task._id === id ? data.task : task));
    } catch (err) {
      setError('Failed to schedule task');
    }
  };

  useEffect(() => {
    if (!isFocusRunning) return;
    const timer = setInterval(() => {
      setFocusTime((prev) => {
        if (prev <= 1) { setIsFocusRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFocusRunning]);

  const priorityColor = { low: 'success', medium: 'warning', high: 'error', urgent: 'error' };
  const priorityWeight = { low: 1, medium: 2, high: 3, urgent: 4 };

  const getSortedTasks = () => {
    const copy = [...tasks];
    switch (sortOrder) {
      case 'priority-high': return copy.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
      case 'priority-low': return copy.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
      case 'newest': return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest': return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'deadline': return copy.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      default: return copy;
    }
  };

  const sortedTasks = getSortedTasks();
  const topTask = tasks.reduce((best, task) => {
    if (!best) return task;
    return priorityWeight[task.priority] > priorityWeight[best.priority] ? task : best;
  }, null);
  const highPriorityCount = tasks.filter((task) => ['high', 'urgent'].includes(task.priority)).length;
  const briefingMessage = lazyMode
    ? `🌙 Lazy Mode is on. Keep it light today and focus on ${topTask ? topTask.title : 'your most important task'} first. Focus timer is 15 minutes.`
    : tasks.length === 0
      ? 'Add a few tasks to unlock a tailored AI briefing.'
      : highPriorityCount > 0
        ? `You have ${tasks.length} tasks. ${topTask ? `Start with "${topTask.title}".` : 'Start with your highest-priority task.'}`
        : `You have ${tasks.length} tasks and a balanced day ahead. Start with the most important item.`;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">Welcome back</Typography>
            <Typography color="text.secondary">Hi, {user?.name}</Typography>
          </Box>
          {lazyMode && (
            <Chip label="🌙 Lazy Mode" sx={{ bgcolor: '#3949ab', color: '#fff', fontWeight: 'bold' }} />
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
          <Paper sx={{ flex: 1, p: 2, borderLeft: '4px solid #1976d2' }}>
            <Typography variant="subtitle2" color="text.secondary">Smart Workload</Typography>
            <Typography variant="h6">Balanced across your week</Typography>
            <Typography variant="body2" color="text.secondary">Schedula spreads heavy work to keep your days realistic.</Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderLeft: lazyMode ? '4px solid #3949ab' : '4px solid #2e7d32' }}>
            <Typography variant="subtitle2" color="text.secondary">{lazyMode ? '🌙 Lazy Mode ON' : 'Lazy Mode'}</Typography>
            <Typography variant="h6">{lazyMode ? 'Easy day active' : 'Easy day mode'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {lazyMode ? 'Focus timer is 15 min. Take it easy today.' : 'Toggle the crescent moon in the header to activate.'}
            </Typography>
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderLeft: '4px solid #ed6c02' }}>
            <Typography variant="subtitle2" color="text.secondary">Progress</Typography>
            <Typography variant="h6">Stay consistent</Typography>
            <Typography variant="body2" color="text.secondary">You have {tasks.length} task{tasks.length === 1 ? '' : 's'} in view.</Typography>
          </Paper>
        </Stack>

        <Paper sx={{ p: 2, mb: 3, bgcolor: lazyMode ? '#1a237e11' : '#f3f8ff' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>AI Daily Briefing</Typography>
          <Typography variant="body2" color="text.secondary">{briefingMessage}</Typography>
        </Paper>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Focus Session {lazyMode ? '🌙' : ''}</Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>{formatTime(focusTime)}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={() => setIsFocusRunning((prev) => !prev)}>
              {isFocusRunning ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outlined" onClick={() => { setIsFocusRunning(false); setFocusTime(lazyMode ? 15 * 60 : 25 * 60); }}>
              Reset
            </Button>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Your Tasks</Typography>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={sortOrder} label="Sort by" onChange={(e) => setSortOrder(e.target.value)}>
              <MenuItem value="priority-high">Priority: High to Low</MenuItem>
              <MenuItem value="priority-low">Priority: Low to High</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="deadline">Deadline Soonest</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary">No tasks yet. Add one from the button above!</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sortedTasks.map(task => {
              const deadlineDate = new Date(task.deadline);
              const isOverdue = deadlineDate < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <Card key={task._id} sx={{ border: isOverdue ? '1px solid #d32f2f' : 'inherit' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{task.title}</Typography>
                      <Chip label={task.priority} color={priorityColor[task.priority]} size="small" />
                    </Box>
                    {task.description && <Typography color="text.secondary" sx={{ mt: 1 }}>{task.description}</Typography>}
                    <Typography variant="body2" sx={{ mt: 1, color: isOverdue ? 'error.main' : 'inherit' }}>
                      Deadline: {deadlineDate.toLocaleDateString()} {isOverdue ? '(Overdue)' : ''}
                    </Typography>
                    <Typography variant="body2">Estimated: {task.estimatedHours} hours</Typography>
                    {task.scheduledDays && task.scheduledDays.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold">AI Schedule:</Typography>
                        {task.scheduledDays.map((day, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            {new Date(day.date).toLocaleDateString()} — {day.hoursPerDay} hrs {day.focus ? `— ${day.focus}` : ''}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" onClick={() => handleSchedule(task._id)}>Schedule with AI</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(task._id)}>Delete</Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </AppShell>
  );
};

export default Dashboard;