import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ovalStyle = {
  borderRadius: '50px',
  padding: '20px 60px',
  margin: '20px',
  fontSize: '1.5rem',
  background: '#217346',
  color: 'white',
  boxShadow: '0 4px 16px rgba(33,115,70,0.12)',
  transition: 'background 0.2s',
  '&:hover': {
    background: '#14532d',
  },
};

export const ChooseMenu = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f8f6',
    }}>
      <Typography variant="h3" sx={{ mb: 4, color: '#217346' }}>
        Choose Your Experience
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
        <Button sx={ovalStyle} onClick={() => navigate('/legacy/projects')}>Legacy</Button>
        <Button sx={ovalStyle} onClick={() => navigate('/planning/budget-vs-actual')}>Planning</Button>
        <Button sx={ovalStyle} onClick={() => navigate('/square')}>Square</Button>
      </Box>
    </Box>
  );
}; 