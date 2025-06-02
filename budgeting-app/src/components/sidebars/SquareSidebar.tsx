import React from 'react';
import { List, ListItemButton, ListItemText, Box, Divider, ListItemIcon } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';

export const SquareSidebar = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List sx={{ px: 0, pt: 0.5 }}>
        <ListItemButton disabled sx={{ borderRadius: '14px', mb: 0.5, p: 1.5, pl: 2, bgcolor: '#f5f5f5' }}>
          <ListItemIcon sx={{ minWidth: 40 }}><AssignmentIcon /></ListItemIcon>
          <ListItemText primary="Coming Soon" />
        </ListItemButton>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 1 }} />
      <List>
        <ListItemButton onClick={() => navigate('/')}> 
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Return to Main" />
        </ListItemButton>
      </List>
    </Box>
  );
}; 