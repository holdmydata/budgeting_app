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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
      sx: {
        borderRadius: 3,
        boxShadow: 6,
      }
    }}>
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', pb: 0 }}>Sign In Required</DialogTitle>
      <DialogContent
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.04)',
          border: '1px solid',
          borderColor: 'divider',
          mt: 1,
          mb: 1,
          px: { xs: 2, sm: 4 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Typography sx={{ fontSize: '1.1rem', color: 'text.primary', mb: 1 }}>
          Please sign in with your Microsoft account to continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
        <Button onClick={onClose} color="secondary" variant="outlined" sx={{ borderRadius: 2, minWidth: 100, mr: 1 }}>
          Cancel
        </Button>
        <Button onClick={handleLogin} variant="contained" color="primary" sx={{ borderRadius: 2, minWidth: 120, fontWeight: 600 }}>
          Sign In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginModal; 