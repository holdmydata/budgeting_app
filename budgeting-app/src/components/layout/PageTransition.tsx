import React from 'react';
import { Box, Grow } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Check if we're in Electron environment
  const isElectron = window.electron !== undefined;

  return (
    <Grow 
      in={true} 
      timeout={400}
      style={{ 
        transformOrigin: '0 0 0',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          ...(isElectron && {
            marginRight: 0,
            paddingRight: 0
          })
        }}
      >
        {children}
      </Box>
    </Grow>
  );
};

export default PageTransition; 