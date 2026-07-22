import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Card, CardContent, CardActions,
  Chip, Button, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getTasks, deleteTask, scheduleTask, completeTask, rescheduleTask } from '../services/api';
import AppShell from '../components/AppShell';

const priorityColor = { low: 'success', medium: 'warning', high: 'error', urgent: 'error' };
const priorityWeight = { low: 1, medium: 2, high: 3, urgent: 4 };

const CurrentTasksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  useEffect(() => { // eslint-disable-next-line
    if (!user) return navigate('/login');
    fetchTasks();
  }, []); // eslint-disable-line

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks();
      const sorted = [...data].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
      setTasks(sorted);
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

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Failed to complete task');
    }
  };

  const openReschedule = (task) => {
    setSelectedTask(task);
    setNewPriority(task.priority);
    setNewDeadline('');
    setRescheduleOpen(true);
  };

  const handleReschedule = async () => {
    try {
      const { data } = await rescheduleTask(selectedTask._id, {
        deadline: newDeadline,
        priority: newPriority
      });
      setTasks(tasks.map(task => task._id === selectedTask._id ? data.task : task).sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]));
      setRescheduleOpen(false);
      setSelectedTask(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reschedule task');
    }
  };

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">Current Tasks</Typography>
          <Typography color="text.secondary">Sorted by priority — highest first.</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <CircularProgress />
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary">No active tasks. Add one from the button above!</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map((task, index) => {
              const deadlineDate = new Date(task.deadline);
              const isOverdue = deadlineDate < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <Card key={task._id} sx={{ border: isOverdue ? '2px solid #d32f2f' : 'inherit' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="bold">
                          #{index + 1}
                        </Typography>
                        <Typography variant="h6">{task.title}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {isOverdue && <Chip label="Overdue" color="error" size="small" />}
                        <Chip label={task.priority} color={priorityColor[task.priority]} size="small" />
                      </Box>
                    </Box>
                    {task.description && (
                      <Typography color="text.secondary" sx={{ mt: 1 }}>{task.description}</Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 1, color: isOverdue ? 'error.main' : 'inherit' }}>
                      Deadline: {deadlineDate.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      Estimated: {task.estimatedHours} hours
                    </Typography>
                    {task.scheduledDays && task.scheduledDays.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold">AI Schedule:</Typography>
                        {task.scheduledDays.map((day, i) => (
                          <Typography key={i} variant="body2" color="text.secondary">
                            {new Date(day.date).toLocaleDateString()} — {day.hoursPerDay} hrs {day.focus ? `— ${day.focus}` : ''}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="success" onClick={() => handleComplete(task._id)}>
                      ✓ Done
                    </Button>
                    {isOverdue && (
                      <Button size="small" color="warning" onClick={() => openReschedule(task)}>
                        Reschedule
                      </Button>
                    )}
                    <Button size="small" color="primary" onClick={() => handleSchedule(task._id)}>
                      Schedule with AI
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(task._id)}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reschedule Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Rescheduling: <strong>{selectedTask?.title}</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>New Deadline</Typography>
              <TextField
                type="date"
                fullWidth
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newPriority}
                label="Priority"
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReschedule}
            disabled={!newDeadline}
          >
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
};

export default CurrentTasksPage;