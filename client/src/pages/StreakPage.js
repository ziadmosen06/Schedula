import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, Paper,
  Stack, Chip, CircularProgress, Alert, Grid
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useAuth } from '../context/AuthContext';
import { getCompletedTasks } from '../services/api';
import AppShell from '../components/AppShell';

const StreakPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const syncDarkMode = () => setDarkMode(localStorage.getItem('darkMode') === 'true');
    window.addEventListener('darkModeChanged', syncDarkMode);
    return () => window.removeEventListener('darkModeChanged', syncDarkMode);
  }, []);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const { data } = await getCompletedTasks({ page: 1, limit: 30 });
        setTasks(data.tasks || []);
      } catch (err) {
        setError('Failed to load streak data');
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedTasks();
  }, []);

  const totalCompleted = tasks.length;
  const currentStreak = Math.max(1, Math.min(7, Math.round(totalCompleted / 2 + 1)));
  const momentum = totalCompleted >= 5 ? 'Strong' : totalCompleted >= 2 ? 'Building' : 'Starting';

  const recentDays = Array.from({ length: 7 }, (_, index) => {
    const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
    const active = index < Math.min(7, Math.max(1, Math.round(totalCompleted / 2)));
    return { dayLabel, active };
  });

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalFireDepartmentIcon sx={{ color: '#ff6f00' }} /> Streak
          </Typography>
          <Typography color="text.secondary">Track your consistency and keep your momentum alive.</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Paper sx={{ p: 3, borderLeft: '4px solid #ff6f00' }}>
              <Typography variant="subtitle2" color="text.secondary">Momentum</Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalFireDepartmentIcon sx={{ color: '#ff6f00' }} /> {currentStreak} day streak
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {user?.name || 'You'} has completed {totalCompleted} task{totalCompleted === 1 ? '' : 's'} and is in a {momentum.toLowerCase()} rhythm.
              </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>This week</Typography>
              <Grid container spacing={1.2}>
                {recentDays.map((day) => (
                  <Grid item xs={12} sm={6} md={4} lg={1.7} key={day.dayLabel}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        textAlign: 'center',
                        bgcolor: day.active
                          ? (darkMode ? '#4a2800' : '#fff3e0')
                          : (darkMode ? '#2a2a2a' : '#f5f5f5'),
                        border: day.active
                          ? `1px solid ${darkMode ? '#ff9800' : '#ffb74d'}`
                          : `1px solid ${darkMode ? '#444' : '#e0e0e0'}`
                      }}
                    >
                      <Typography variant="caption" sx={{ color: darkMode ? '#aaa' : 'text.secondary' }}>
                        {day.dayLabel}
                      </Typography>
                      <Typography variant="h6" sx={{ color: day.active ? '#ff9800' : (darkMode ? '#555' : 'inherit') }}>
                        {day.active ? '●' : '○'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Recent wins</Typography>
              {tasks.length === 0 ? (
                <Typography color="text.secondary">Complete a task to start building your streak.</Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {tasks.slice(0, 6).map((task) => (
                    <Chip key={task._id} label={task.title} color="warning" variant="outlined" />
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        )}
      </Container>
    </AppShell>
  );
};

export default StreakPage;