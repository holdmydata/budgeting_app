import * as React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('sm')]: {
    paddingLeft: '280px', // Match drawer width
  }
}));

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <FooterContainer>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Hold My Budget •{' '}
        <Link href="/help" color="inherit" underline="hover">
          Help & Support
        </Link>
        {' • '}
        <Link href="/privacy" color="inherit" underline="hover">
          Privacy
        </Link>
        {' • '}
        <Link href="/terms" color="inherit" underline="hover">
          Terms
        </Link>
      </Typography>
    </FooterContainer>
  );
};

export default Footer; 