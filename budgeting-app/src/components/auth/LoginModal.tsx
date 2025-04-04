import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Sign In Required</DialogTitle>
      <DialogContent>
        <Typography>
          Please sign in with your Microsoft account to continue.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLogin} variant="contained" color="primary">
          Sign In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginModal; 