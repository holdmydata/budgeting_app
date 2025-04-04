import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, CircularProgress } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import theme from './theme/theme';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import Projects from './pages/Projects';
import { Help } from './pages/Help';
import { GLAccounts } from './pages/GLAccounts';
import Expenses from './pages/Expenses';
import Vendors from './pages/Vendors';
import { Suspense, useEffect } from 'react';

// Simple placeholder components for settings and profile pages
const Settings = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ mb: 2 }}>Settings</Typography>
    <Typography>This page will contain application settings.</Typography>
  </Box>
);

const Profile = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ mb: 2 }}>User Profile</Typography>
    <Typography>This page will contain user profile settings.</Typography>
  </Box>
);

const Reports = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ mb: 2 }}>Reports</Typography>
    <Typography>This page will contain reports.</Typography>
  </Box>
);

const Budgets = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ mb: 2 }}>Budgets</Typography>
    <Typography>This page will contain budgets.</Typography>
  </Box>
);

// Login component
const Login = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Budget Pro</Typography>
        <Typography sx={{ mb: 3 }}>Enterprise Budgeting Application</Typography>
        <button 
          onClick={() => {}}
          style={{
            padding: '10px 20px',
            backgroundColor: '#217346',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Sign in with Microsoft
        </button>
      </Box>
    </Box>
  );
};

// Fallback component for loading state
const LoadingFallback = () => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    bgcolor: '#f5f8f6'
  }}>
    <CircularProgress sx={{ color: '#217346', mb: 2 }} />
    <Typography>Loading application...</Typography>
  </Box>
);

// Not found page
const NotFound = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h4" sx={{ mb: 2 }}>Page Not Found</Typography>
    <Typography>The page you are looking for doesn't exist or has been moved.</Typography>
  </Box>
);

function App() {
  // Log when the app renders for debugging
  useEffect(() => {
    console.log('App component rendered');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingFallback />}>
        <Router basename="">
          <DataProvider>
            <AuthProvider>
              <Routes>
                {/* Login route */}
                <Route path="login" element={<Login />} />
                
                {/* Main layout with child routes */}
                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="budgets" element={<Layout><Budgets /></Layout>} />
                <Route path="projects" element={<Layout><Projects /></Layout>} />
                <Route path="reports" element={<Layout><Reports /></Layout>} />
                <Route path="settings" element={<Layout><Settings /></Layout>} />
                <Route path="profile" element={<Layout><Profile /></Layout>} />
                <Route path="help" element={<Layout><Help /></Layout>} />
                <Route path="gl-accounts" element={<Layout><GLAccounts /></Layout>} />
                <Route path="expenses" element={<Layout><Expenses /></Layout>} />
                <Route path="vendors" element={<Layout><Vendors /></Layout>} />
                
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </DataProvider>
        </Router>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
