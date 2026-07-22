import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, TextField, Pagination, CircularProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getCompletedTasks } from '../services/api';

const SidebarHistoryPanel = ({ onClose }) => {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ tasks: [], total: 0, page: 1, pages: 1 });

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: res } = await getCompletedTasks({ q, page, limit });
      setData(res);
    } catch (err) {
      setData({ tasks: [], total: 0, page: 1, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetch();
  };

  return (
    <Box sx={{ width: 360, p: 2 }} role="presentation">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">History</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <TextField placeholder="Search title" size="small" fullWidth value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} sx={{ mb: 2 }} />

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <List dense>
            {data.tasks.map((t) => (
              <ListItem key={t._id} alignItems="flex-start">
                <ListItemText primary={t.title} secondary={new Date(t.updatedAt || t.createdAt).toLocaleDateString()} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Pagination count={data.pages} page={page} onChange={(_, val) => setPage(val)} size="small" />
          </Box>
        </>
      )}
    </Box>
  );
};

export default SidebarHistoryPanel;
