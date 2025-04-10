import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, Grow } from '@mui/material';
import { keyframes } from '@mui/system';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: scale(1.15) rotate(5deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  75% {
    transform: scale(1.15) rotate(-5deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`;

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [showText, setShowText] = useState(false);
  const [showSubText, setShowSubText] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're running in Electron
  const isElectron = window.electron !== undefined;
  
  useEffect(() => {
    console.log("SplashScreen mounted", {
      isElectron,
      environment: process.env.NODE_ENV,
      electronAPI: isElectron ? Object.keys(window.electron || {}) : 'Not available'
    });

    try {
      // For Electron, check if the main process is ready
      if (isElectron && window.electron) {
        window.electron.send('check-ready');
        
        // Listen for ready status from main process
        window.electron.receive('app-ready', () => {
          console.log("Received app-ready signal from main process");
          startAnimationSequence();
        });

        // Listen for any errors from main process
        window.electron.receive('app-error', (errorMsg: string) => {
          console.error("Received error from main process:", errorMsg);
          setError(errorMsg);
          // Still finish after a delay even if there's an error
          setTimeout(onFinish, 3000);
        });

        return () => {
          if (window.electron) {
            window.electron.removeAllListeners('app-ready');
            window.electron.removeAllListeners('app-error');
          }
        };
      } else {
        // For web, just start the animation sequence
        startAnimationSequence();
      }
    } catch (err) {
      console.error("Error in SplashScreen initialization:", err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      // Still finish after a delay even if there's an error
      setTimeout(onFinish, 3000);
    }
  }, [isElectron, onFinish]);

  const startAnimationSequence = () => {
    console.log("Starting animation sequence");
    
    const timers: NodeJS.Timeout[] = [];

    try {
      // Show main text after logo appears
      timers.push(setTimeout(() => {
        console.log("Showing main text");
        setShowText(true);
      }, 600));

      // Show subtext after main text
      timers.push(setTimeout(() => {
        console.log("Showing subtext");
        setShowSubText(true);
      }, 1000));

      // Start fade out animation
      timers.push(setTimeout(() => {
        console.log("Starting fade out");
        setFadingOut(true);
      }, 2000));

      // Hide splash screen after animation
      timers.push(setTimeout(() => {
        console.log("Finishing splash screen");
        onFinish();
      }, 2500));

      // Force completion after timeout (safety mechanism)
      timers.push(setTimeout(() => {
        console.log("Force completing splash screen (safety timeout)");
        onFinish();
      }, 5000));
    } catch (err) {
      console.error("Error in animation sequence:", err);
      // Clean up timers
      timers.forEach(timer => clearTimeout(timer));
      // Force finish
      onFinish();
    }

    return () => timers.forEach(timer => clearTimeout(timer));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#217346',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        background: `radial-gradient(circle at 15% 85%, #2E8555 0%, #217346 50%),
                    radial-gradient(circle at 85% 15%, #1A5D38 0%, #217346 55%)`,
      }}
    >
      <Grow in={!error} timeout={600}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '24px',
            bgcolor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#217346',
            fontWeight: 800,
            fontSize: '48px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            mb: 4,
            transition: 'all 0.3s ease',
          }}
        >
          H
        </Box>
      </Grow>
      <Fade in={showText} timeout={700}>
        <Typography
          variant="h2"
          sx={{
            color: '#ffffff',
            fontWeight: 800,
            letterSpacing: '1px',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
          }}
        >
          {error ? 'Loading Error' : 'Hold My Budget'}
        </Typography>
      </Fade>
      <Fade in={showSubText} timeout={600}>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            letterSpacing: '2px',
            mt: 2,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          {error ? error : 'Your Financial Companion'}
        </Typography>
      </Fade>
    </Box>
  );
};

export default SplashScreen; 