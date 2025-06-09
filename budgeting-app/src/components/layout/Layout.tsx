import * as React from 'react';
import { useState, ReactNode, useEffect } from 'react';
import { 
  Box, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Avatar,
  Paper,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import PageTransition from './PageTransition';
import Footer from './Footer';
import SplashScreen from '../SplashScreen';
import TitleBar from './TitleBar';

const drawerWidth = 280;


interface LayoutProps {
  children: ReactNode;
  sidebar?: React.ReactNode;
}

interface NavigationItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: theme.palette.background.default,
  paddingTop: window.electron ? '32px' : 0,
  height: '100vh',
  overflow: 'hidden'
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexGrow: 1,
  marginTop: '64px',
  marginBottom: 0,
  position: 'relative',
  height: `calc(100vh - ${window.electron ? '96px' : '64px'})`,
  overflow: 'hidden',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  paddingRight: window.electron ? '2px' : 0,
  [theme.breakpoints.up('sm')]: {
    marginLeft: window.electron ? 0 : 4,
    marginRight: window.electron ? '2px' : 0,
    width: window.electron ? '100%' : `calc(100% - ${drawerWidth * 0.8}px)`,
  }
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(0),
  paddingRight: window.electron ? theme.spacing(.5) : 0,
  paddingLeft: window.electron ? theme.spacing(1.5) : 0,
  position: 'relative',
  overflow: 'auto',
  height: '100%',
  width: '100%',
  maxWidth: 'max',
  boxSizing: 'border-box',
  margin: 0,
  marginLeft: 0,
  marginRight: window.electron ? theme.spacing(.5) : 0
}));

export const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  const { isAuthenticated, isInitializing, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [electronDetected, setElectronDetected] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if running in Electron
  useEffect(() => {
    console.log("Checking for Electron environment...");
    const isElectron = window.electron !== undefined;
    setElectronDetected(isElectron);
    console.log("Electron detected:", isElectron);
    
    // Add electron-mode class to body when in Electron
    if (isElectron && window.electron) {
      document.body.classList.add('electron-mode');
      console.log("Added electron-mode class to body");
      
      // Set up app-ready listener
      const electron = window.electron;
      
      // Send check-ready signal immediately
      console.log("Sending check-ready signal");
      electron.send('check-ready');
      
      electron.receive('app-ready', () => {
        console.log("Received app-ready signal");
        setAppReady(true);
        setShowSplash(false);
      });

      // Set up error listener
      electron.receive('app-error', (error) => {
        console.error("Received app error:", error);
        // Still set app as ready to show error state
        setAppReady(true);
        setShowSplash(false);
      });

      // Set up a periodic check for app readiness
      const readinessCheck = setInterval(() => {
        if (!appReady) {
          console.log("Re-checking app readiness...");
          electron.send('check-ready');
        }
      }, 1000);

      return () => {
        clearInterval(readinessCheck);
        electron.removeAllListeners('app-ready');
        electron.removeAllListeners('app-error');
      };
    } else {
      document.body.classList.remove('electron-mode');
      // In web mode, app is ready immediately
      setAppReady(true);
      setShowSplash(false);
    }
    
    // For debugging purposes, log window object properties
    console.log("Window properties:", Object.keys(window));
    if (isElectron && window.electron) {
      console.log("Electron API methods:", Object.keys(window.electron as object));
    }
  }, [appReady]);
  
  // Use localStorage to track if the splash has been shown
  useEffect(() => {
    // Skip splash in production Electron mode to avoid potential issues
    const isElectron = window.electron !== undefined;
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isElectron && isProduction) {
      console.log("Skipping splash screen in production Electron mode");
      setShowSplash(false);
      return;
    }
    
    // In development mode or first run, show splash
    const hasShownSplash = localStorage.getItem('hasShownSplash');
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!hasShownSplash || isDev) {
      console.log("Showing splash screen (first run or dev mode)");
      setShowSplash(true);
      
      // Force hide splash after 6 seconds as a safety mechanism
      const forcedHideTimer = setTimeout(() => {
        console.log("Force hiding splash screen (safety timeout)");
        setShowSplash(false);
      }, 6000);
      
      // Only set localStorage if it's not dev mode
      if (!isDev) {
        localStorage.setItem('hasShownSplash', 'true');
      }
      
      return () => clearTimeout(forcedHideTimer);
    } else {
      console.log("Splash screen already shown before, skipping");
    }
  }, []);

  // If auth is still initializing or not authenticated, just render children directly
  if (isInitializing || !isAuthenticated) {
    console.log("Auth state: initializing or not authenticated. Rendering children directly.");
    return <>{children}</>;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  const handleNavigation = (path: string) => {
    console.log("Navigating to path:", path);
    navigate(path.startsWith('/') ? path : `/${path}`);
    setMobileOpen(false);
  };

  const navigationItems: NavigationItem[] = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Budget vs Actual', path: '/planning/budget-vs-actual', icon: <AccountBalanceIcon /> },
    // { text: 'Scenario Planning', path: '/scenario-planning', icon: <AssignmentIcon /> },
    // { text: 'Strategic Planning', path: '/strategic-planning', icon: <AssignmentIcon /> },
    // { text: 'Vendor Optimization', path: '/vendor-optimization', icon: <BusinessIcon /> },
    { text: 'GL Accounts', path: '/legacy/gl-accounts', icon: <AssignmentIcon /> },
    // { text: 'Expenses', path: '/expenses', icon: <ReceiptIcon /> },
    // { text: 'Projects', path: '/legacy/projects', icon: <AssignmentIcon /> },
    { text: 'Vendors', path: '/legacy/vendors', icon: <BusinessIcon /> },
    { text: 'Data Source', path: '/data-source', icon: <StorageIcon /> },
    { text: 'Help & Resources', path: '/help', icon: <HelpOutlineIcon /> },
  ];
  
  // Determine current page title with improved path matching
  const currentPathname = location.pathname === '/' ? '/' : location.pathname.replace(/^\/+/, '/');
  const currentPageTitle = navigationItems.find(item => 
    item.path === currentPathname || 
    (item.path !== '/' && currentPathname.startsWith(item.path))
  )?.text || 'Hold My Budget';
  
  // For demo purposes - in a real app, this would come from user data
  const userRole = 'CIO'; // Or 'Finance Manager' or other roles

  const drawer = sidebar ? (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#217346',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 15% 85%, ${alpha('#2E8555', 0.25)} 0%, transparent 50%),\n                       radial-gradient(circle at 85% 15%, ${alpha('#1A5D38', 0.15)} 0%, transparent 55%)`,
          zIndex: 0,
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            letterSpacing: '0.2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box 
            component="span"
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: '#ffffff',
              color: '#217346',
              fontWeight: 800,
              fontSize: '16px',
              mr: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              marginLeft: 0,
            }}
          >
            H
          </Box>
          <Box sx={{ 
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.1)
            }
          }}>
            Hold My Budget
          </Box>
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          mx: 2.5,
          mb: 2,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '10px 14px',
            borderRadius: '16px',
            backgroundColor: alpha('#ffffff', 0.06),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.1),
            },
          }}
        >
          <Avatar 
            alt={user?.name || 'User'} 
            sx={{ 
              bgcolor: '#D97D45',
              width: 42,
              height: 42,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              color: '#ffffff',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </Avatar>
          
          <Box sx={{ ml: 1.5, mr: 0.5, flexGrow: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700,
                color: '#ffffff',
                fontSize: '0.95rem',
                lineHeight: 1.2,
                letterSpacing: '0.2px',
              }}
            >
              Development User
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: alpha('#ffffff', 0.7), 
                fontSize: '0.75rem',
                lineHeight: 1.2,
                letterSpacing: '0.2px',
                display: 'block',
                textAlign: 'center',
                width: '100%',
                paddingTop: '2px',
              }}
            >
              CIO
            </Typography>
          </Box>
          
          <IconButton 
            size="small" 
            sx={{ 
              color: alpha('#ffffff', 0.7),
              '&:hover': { 
                backgroundColor: alpha('#ffffff', 0.1),
                color: '#ffffff'
              }
            }}
            onClick={handleLogout}
          >
            <ExitToAppIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
      
      <Divider sx={{ 
        my: 0.5,
        mx: 2.5, 
        opacity: 0.1,
        position: 'relative',
        zIndex: 1
      }} />
      
      <Box sx={{ px: 2, py: 1, flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {sidebar}
      </Box>
      
      <Divider sx={{ 
        mt: 'auto', 
        mb: 2, 
        mx: 2.5, 
        opacity: 0.1,
        position: 'relative',
        zIndex: 1 
      }} />
    </Box>
  ) : (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#217346',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 15% 85%, ${alpha('#2E8555', 0.25)} 0%, transparent 50%),
                       radial-gradient(circle at 85% 15%, ${alpha('#1A5D38', 0.15)} 0%, transparent 55%)`,
          zIndex: 0,
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            letterSpacing: '0.2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box 
            component="span"
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: '#ffffff',
              color: '#217346',
              fontWeight: 800,
              fontSize: '16px',
              mr: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              marginLeft: 0,
            }}
          >
            H
          </Box>
          <Box sx={{ 
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.1)
            }
          }}>
            Hold My Budget
          </Box>
        </Typography>
      </Box>
      
      <Box 
        sx={{ 
          mx: 2.5,
          mb: 2,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '10px 14px',
            borderRadius: '16px',
            backgroundColor: alpha('#ffffff', 0.06),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha('#ffffff', 0.1),
            },
          }}
        >
          <Avatar 
            alt={user?.name || 'User'} 
            sx={{ 
              bgcolor: '#D97D45',
              width: 42,
              height: 42,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              color: '#ffffff',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </Avatar>
          
          <Box sx={{ ml: 1.5, mr: 0.5, flexGrow: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700,
                color: '#ffffff',
                fontSize: '0.95rem',
                lineHeight: 1.2,
                letterSpacing: '0.2px',
              }}
            >
              Development User
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: alpha('#ffffff', 0.7), 
                fontSize: '0.75rem',
                lineHeight: 1.2,
                letterSpacing: '0.2px',
                display: 'block',
                textAlign: 'center',
                width: '100%',
                paddingTop: '2px',
              }}
            >
              CIO
            </Typography>
          </Box>
          
          <IconButton 
            size="small" 
            sx={{ 
              color: alpha('#ffffff', 0.7),
              '&:hover': { 
                backgroundColor: alpha('#ffffff', 0.1),
                color: '#ffffff'
              }
            }}
            onClick={handleLogout}
          >
            <ExitToAppIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
      
      <Divider sx={{ 
        my: 0.5,
        mx: 2.5, 
        opacity: 0.1,
        position: 'relative',
        zIndex: 1
      }} />
      
      <Typography 
        variant="caption" 
        sx={{ 
          px: 3, 
          py: 1,
          color: alpha('#ffffff', 0.7),
          fontWeight: 700,
          letterSpacing: '0.2px',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        Navigation
      </Typography>
      
      <List sx={{ px: 2, py: 0.5, flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {navigationItems.map((item) => {
          const isSelected = item.path === currentPathname || 
            (item.path !== '/' && currentPathname.startsWith(item.path));
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '14px',
                  transition: 'all 0.2s ease',
                  p: 1.5,
                  paddingLeft: 2,
                  backgroundColor: isSelected 
                    ? alpha('#ffffff', 0.1)
                    : 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: alpha('#ffffff', 0.1),
                  },
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.07),
                    transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: alpha('#ffffff', 0.15),
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isSelected ? '#ffffff' : alpha('#ffffff', 0.7),
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 500,
                    color: '#ffffff',
                    letterSpacing: '0.2px',
                  }}
                />
                {isSelected && (
                  <Box 
                    sx={{ 
                      width: 4, 
                      height: 24, 
                      borderRadius: '4px',
                      bgcolor: '#ffffff',
                      ml: 1,
                      boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ 
        mt: 'auto', 
        mb: 2, 
        mx: 2.5, 
        opacity: 0.1,
        position: 'relative',
        zIndex: 1 
      }} />
    </Box>
  );

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => {
        console.log("Splash screen finished, hiding it now");
        setShowSplash(false);
      }} />}
      
      <Box sx={{ 
        display: (!showSplash && appReady) ? 'block' : 'none', 
        width: '100%',
        height: '100%',
        opacity: (!showSplash && appReady) ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        position: 'relative'
      }}>
        <LayoutRoot>
          {electronDetected && <TitleBar />}
          <Header 
            drawerWidth={drawerWidth} 
            handleDrawerToggle={handleDrawerToggle} 
            currentPageTitle={currentPageTitle}
            userRole={userRole}
          />
          <ContentWrapper>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: drawerWidth,
                  boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1)',
                  borderRight: 'none',
                },
              }}
            >
              {drawer}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: drawerWidth,
                  boxShadow: '5px 0 25px rgba(0, 0, 0, 0.05)',
                  borderRight: 'none',
                  backgroundImage: 'none',
                  height: '100%',
                  paddingBottom: '36px',
                  top: window.electron ? '32px' : 0,
                  position: 'fixed',
                  zIndex: 1
                },
              }}
              open
            >
              {drawer}
            </Drawer>
            <MainContent>
              <PageTransition>
                <Box 
                  sx={{ 
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%',
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                    bgcolor: alpha('#f5f8f6', 0.8),
                    backgroundImage: `radial-gradient(circle at 85% 10%, ${alpha('#217346', 0.04)} 0%, transparent 40%),
                                      radial-gradient(circle at 15% 95%, ${alpha('#2E8555', 0.05)} 0%, transparent 50%)`,
                    flexGrow: 1,
                    m: 0,
                    mt: 2,
                    mb: 7,
                    ml: { xs: 2, sm: electronDetected ? 3 : 0 },
                    mr: { xs: 2, sm: electronDetected ? 3 : 0 },
                    pt: { xs: 3, sm: 2 },
                    pb: { xs: 3, sm: 2 },
                    pl: { xs: 3, sm: 2 },
                    pr: { xs: 3, sm: electronDetected ? 4 : 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    position: 'relative',
                    zIndex: 2,
                    minHeight: '300px'
                  }}
                >
                  {/* Debug indicator - removing */}
                  {false && process.env.NODE_ENV === 'development' && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        bgcolor: 'info.main', 
                        color: 'white', 
                        px: 1, 
                        py: 0.5, 
                        fontSize: '0.75rem',
                        borderBottomLeftRadius: 4
                      }}
                    >
                      {location.pathname}
                    </Box>
                  )}
                  {children}
                </Box>
              </PageTransition>
            </MainContent>
          </ContentWrapper>
          <Footer />
        </LayoutRoot>
      </Box>

      {/* Debug overlay */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            padding: 2,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: 1,
            zIndex: 9999,
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          <div>Electron: {electronDetected ? 'Yes' : 'No'}</div>
          <div>App Ready: {appReady ? 'Yes' : 'No'}</div>
          <div>Show Splash: {showSplash ? 'Yes' : 'No'}</div>
        </Box>
      )}
    </>
  );
}; 