import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import HistoryIcon from '@mui/icons-material/History';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const SidebarNavPanel = ({ onClose, onSelect, darkMode }) => {
  const sections = [
    { id: 'home', label: 'Home', description: 'Go back to the main dashboard', icon: <HomeIcon sx={{ color: '#9c27b0' }} /> },
    { id: 'current', label: 'Current Tasks', description: 'Active tasks sorted by priority', icon: <TaskAltIcon sx={{ color: '#1976d2' }} /> },
    { id: 'calendar', label: 'Calendar', description: 'View tasks on a daily timeline', icon: <CalendarMonthIcon sx={{ color: '#0097a7' }} /> },
    { id: 'history', label: 'History', description: 'Completed tasks and past progress', icon: <HistoryIcon sx={{ color: '#388e3c' }} /> },
    { id: 'streak', label: 'Streak', description: 'Fire streak calendar', icon: <LocalFireDepartmentIcon sx={{ color: '#ff6f00' }} /> }
  ];

  return (
    <Box
      sx={{
        width: 360,
        p: 2,
        bgcolor: darkMode ? '#1e1e1e' : '#fff',
        color: darkMode ? '#fff' : '#000',
        height: '100%'
      }}
      role="presentation"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="h6"
          sx={{ cursor: 'pointer', color: darkMode ? '#fff' : '#000' }}
          onClick={() => onSelect('home')}
        >
          Quick Access
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: darkMode ? '#fff' : '#000' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        {sections.map((section) => (
          <React.Fragment key={section.id}>
            <ListItemButton
              onClick={() => onSelect(section.id)}
              sx={{ borderRadius: 1, '&:hover': { bgcolor: darkMode ? '#2a2a2a' : '#f5f5f5' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, width: '100%' }}>
                {section.icon}
                <ListItemText
                  primary={section.label}
                  secondary={section.description}
                  primaryTypographyProps={{ color: darkMode ? '#fff' : '#000' }}
                  secondaryTypographyProps={{ color: darkMode ? '#aaa' : 'text.secondary' }}
                />
              </Box>
            </ListItemButton>
            <Divider sx={{ borderColor: darkMode ? '#333' : '#e0e0e0' }} />
          </React.Fragment>
        ))}
      </List>

      <Box sx={{
        mt: 2, p: 2, borderRadius: 2,
        bgcolor: darkMode ? '#2a1a00' : '#fff7e6',
        border: `1px solid ${darkMode ? '#7a4500' : '#ffd08a'}`
      }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: darkMode ? '#ffb74d' : '#b25f00' }}>
          <LocalFireDepartmentIcon sx={{ color: '#ff6f00' }} /> Tip
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: darkMode ? '#aaa' : 'text.secondary' }}>
          Keep your momentum going. Complete tasks daily to grow your flame.
        </Typography>
      </Box>
    </Box>
  );
};

export default SidebarNavPanel;