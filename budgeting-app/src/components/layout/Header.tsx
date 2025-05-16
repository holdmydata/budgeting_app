import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  alpha,
  Badge,
  Tooltip,
  Button,
  ListItemIcon,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
  currentPageTitle: string;
  userRole?: string;
}

const Header: React.FC<HeaderProps> = ({
  drawerWidth,
  handleDrawerToggle,
  currentPageTitle,
  userRole = 'Administrator'
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = React.useState<null | HTMLElement>(null);
  const { connectionType, usingMockFallback } = useData();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  // Different call-to-action based on user role
  const getCallToAction = () => {
    switch (userRole) {
      case 'CIO':
        return (
          <Tooltip title="Executive Dashboard">
            <IconButton
              sx={{
                ml: 2,
                bgcolor: alpha('#ffffff', 0.15),
                color: '#ffffff',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.25),
                },
                width: 42,
                height: 42,
                borderRadius: '10px',
              }}
              onClick={() => navigate('/executive-dashboard')}
            >
              <InsightsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      case 'Finance Manager':
        return (
          <Tooltip title="Review Budgets">
            <IconButton
              sx={{
                ml: 2,
                bgcolor: alpha('#ffffff', 0.15),
                color: '#ffffff',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.25),
                },
                width: 42,
                height: 42,
                borderRadius: '10px',
              }}
              onClick={() => navigate('/budget-approval')}
            >
              <TrendingUpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: '#217346',
        color: '#ffffff',
        height: { xs: 'auto', sm: '64px' },
        zIndex: (theme) => theme.zIndex.drawer - 1,
        borderBottom: 'none',
        top: window.electron ? '32px' : 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#217346',
          zIndex: -1
        }
      }}
    >
      <Toolbar sx={{ 
        height: { xs: '64px', sm: '64px' },
        minHeight: { xs: '64px', sm: '64px' },
        px: { xs: 1, sm: 3 },
        display: 'flex', 
        flexWrap: 'nowrap', 
        justifyContent: 'space-between',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              backgroundColor: alpha('#ffffff', 0.15),
              color: '#ffffff',
              borderRadius: '10px',
              p: 1,
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.25),
              },
              transition: 'all 0.2s',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                letterSpacing: '0.2px',
              }}
            >
              <Box sx={{
                color: '#ffffff', 
                fontWeight: 500, 
                mr: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.1)
                }
              }}>
                {currentPageTitle || 'Hold My Budget'}
              </Box>
              {/* Mock fallback warning chip */}
              {usingMockFallback && (
                <Chip
                  icon={<span style={{ fontSize: 18 }}>⚠️</span>}
                  label="Mock Data Fallback"
                  size="small"
                  sx={{
                    ml: 1,
                    bgcolor: '#fffbe6',
                    color: '#ad6800',
                    fontWeight: 700,
                    border: '1px solid #ffe58f',
                    fontSize: '0.8rem',
                    height: 26,
                    letterSpacing: '0.2px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}
                />
              )}
            </Typography>
            
            {userRole && (
              <Chip
                label={userRole}
                size="small"
                sx={{
                  ml: 2,
                  bgcolor: alpha('#ffffff', 0.15),
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                  display: { xs: 'none', sm: 'flex' },
                  border: `1px solid ${alpha('#ffffff', 0.2)}`,
                  letterSpacing: '0.3px',
                }}
              />
            )}
          </Box>
          
          {getCallToAction()}
        </Box>
        
        <Box sx={{ display: 'flex', gap: { xs: 0.8, sm: 1.2 }, ml: 1, flexShrink: 0, alignItems: 'center' }}>
          <Tooltip title="Help & Resources">
            <IconButton 
              size="small"
              sx={{
                bgcolor: 'transparent',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.1),
                },
                borderRadius: '10px',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              size="small"
              onClick={handleNotificationsOpen}
              sx={{
                bgcolor: 'transparent',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.1),
                },
                borderRadius: '10px',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    height: 18,
                    minWidth: 18,
                    padding: '0 4px',
                  }
                }}
              >
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <IconButton
            onClick={handleUserMenuOpen}
            sx={{
              p: 0,
              ml: { xs: 0.5, sm: 0.5 },
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Avatar 
              alt={user?.name || 'User'} 
              sx={{ 
                bgcolor: '#D97D45',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              D
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))',
            borderRadius: '16px',
            minWidth: 320,
            maxWidth: 350,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: -10,
              right: 16,
              width: 20,
              height: 20,
              backgroundColor: theme.palette.background.paper,
              transform: 'rotate(45deg)',
              zIndex: 0,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} fontSize="0.95rem">Notifications</Typography>
          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
            You have 3 unread notifications
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
          <MenuItem sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.primary.main,
              mr: 1.5,
              mt: 0.3,
              flexShrink: 0
            }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>Budget Update</Typography>
              <Typography variant="caption" color="text.secondary">
                Q3 budget is ready for your review
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                10 minutes ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.warning.main,
              mr: 1.5,
              mt: 0.3,
              flexShrink: 0
            }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>Approval Needed</Typography>
              <Typography variant="caption" color="text.secondary">
                New vendor expense request requires approval
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                2 hours ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.error.main,
              mr: 1.5,
              mt: 0.3,
              flexShrink: 0
            }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>Cost Alert</Typography>
              <Typography variant="caption" color="text.secondary">
                Cloud infrastructure costs exceeded monthly threshold
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Yesterday
              </Typography>
            </Box>
          </MenuItem>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1.5 }}>
          <Button 
            size="small" 
            sx={{ 
              fontSize: '0.8rem', 
              fontWeight: 600,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
            onClick={handleNotificationsClose}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>

      {/* User Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={userMenuAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            ml: { xs: 0, md: 2 },
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.08))',
            borderRadius: '16px',
            backgroundImage: 'none',
            minWidth: 220,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: -10,
              right: 16,
              width: 20,
              height: 20,
              backgroundColor: theme.palette.background.paper,
              transform: 'rotate(45deg)',
              zIndex: 0,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            },
            '& .MuiMenu-list': {
              padding: '8px',
            },
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography component="h6" variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, fontSize: '0.95rem' }}>
            {user?.name || 'Guest User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', letterSpacing: '0.2px' }}>
            {userRole} • Finance Team
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1, opacity: 0.6 }} />
        
        <MenuItem 
          onClick={() => { handleUserMenuClose(); navigate('/profile'); }}
          sx={{
            borderRadius: '10px',
            mx: 1,
            px: 1.5,
            py: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={600}>Your Profile</Typography>
        </MenuItem>
        
        <MenuItem 
          onClick={() => { handleUserMenuClose(); navigate('/settings'); }}
          sx={{
            borderRadius: '10px',
            mx: 1,
            px: 1.5,
            py: 1,
            '&:hover': {
              backgroundColor: alpha(theme.palette.action.hover, 0.04),
            },
          }}
        >
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={600}>Account Settings</Typography>
        </MenuItem>
        
        <Divider sx={{ my: 1, opacity: 0.6 }} />
        
        <MenuItem 
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            mx: 1,
            px: 1.5,
            py: 1,
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.04),
            },
          }}
        >
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={600}>Sign Out</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header; 