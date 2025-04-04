import React, { useEffect } from 'react';
import { Box, IconButton, Typography, alpha } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import { styled } from '@mui/material/styles';

// Add type declarations for the electron object
declare global {
  interface Window {
    electron?: {
      send: (channel: string, ...args: any[]) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

const TitleBarContainer = styled(Box)(({ theme }) => ({
  height: '32px',
  backgroundColor: '#217346',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  WebkitAppRegion: 'drag',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  width: '100%'
}));

const WindowControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  WebkitAppRegion: 'no-drag',
});

const WindowControlButton = styled(IconButton)(() => ({
  padding: 6,
  borderRadius: 0,
  color: '#ffffff',
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.1),
  },
  '& svg': {
    fontSize: '1.2rem',
  },
}));

const TitleBar: React.FC = () => {
  useEffect(() => {
    console.log("TitleBar component mounted");
    console.log("Electron object available:", !!window.electron);
    
    // Return cleanup function
    return () => {
      console.log("TitleBar component unmounted");
    };
  }, []);

  const handleMinimize = () => {
    console.log("Minimize button clicked");
    try {
      if (window.electron) {
        window.electron.send('window-control', 'minimize');
      } else {
        console.error("Electron object not available for minimize");
      }
    } catch (error) {
      console.error("Error in minimize:", error);
    }
  };

  const handleMaximizeRestore = () => {
    console.log("Maximize/restore button clicked");
    try {
      if (window.electron) {
        window.electron.send('window-control', 'maximize');
      } else {
        console.error("Electron object not available for maximize");
      }
    } catch (error) {
      console.error("Error in maximize/restore:", error);
    }
  };

  const handleQuit = () => {
    console.log("Close button clicked");
    try {
      if (window.electron) {
        window.electron.send('window-control', 'close');
      } else {
        console.error("Electron object not available for close");
      }
    } catch (error) {
      console.error("Error in quit:", error);
    }
  };

  return (
    <TitleBarContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
        <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
          Hold My Budget
        </Typography>
      </Box>
      <WindowControls>
        <WindowControlButton
          onClick={handleMinimize}
          size="small"
          aria-label="Minimize"
        >
          <MinimizeIcon />
        </WindowControlButton>
        <WindowControlButton
          onClick={handleMaximizeRestore}
          size="small"
          aria-label="Maximize"
        >
          <CropSquareIcon />
        </WindowControlButton>
        <WindowControlButton
          onClick={handleQuit}
          size="small"
          aria-label="Close"
          sx={{
            '&:hover': {
              backgroundColor: '#e81123',
            },
          }}
        >
          <CloseIcon />
        </WindowControlButton>
      </WindowControls>
    </TitleBarContainer>
  );
};

export default TitleBar; 