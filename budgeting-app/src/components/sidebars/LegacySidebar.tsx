import React from 'react';
import { List, ListItemButton, ListItemText, Box, Divider, ListItemIcon } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BusinessIcon from '@mui/icons-material/Business';

const links = [
  { to: '/legacy/projects', label: 'Projects', icon: <AssignmentIcon /> },
  { to: '/legacy/gl-accounts', label: 'GL Accounts', icon: <AccountBalanceIcon /> },
  { to: '/legacy/expenses', label: 'Expenses', icon: <ReceiptIcon /> },
  { to: '/legacy/vendors', label: 'Vendors', icon: <BusinessIcon /> },
];

export const LegacySidebar = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List sx={{ px: 0, pt: 0.5 }}>
        {links.map(link => (
          <ListItemButton
            key={link.to}
            component={NavLink}
            to={link.to}
            sx={{
              borderRadius: '14px',
              mb: 0.5,
              p: 1.5,
              pl: 2,
              '&.active': {
                bgcolor: '#f5f5f5',
                fontWeight: 'bold',
              },
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
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