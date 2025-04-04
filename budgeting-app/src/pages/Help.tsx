import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  alpha,
  Breadcrumbs,
  Link,
  TextField,
  Avatar,
  InputAdornment,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Help as HelpIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  Lightbulb as LightbulbIcon,
  Book as BookIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `help-tab-${index}`,
    'aria-controls': `help-tabpanel-${index}`,
  };
}

export const Help: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    'getting-started': true,
    'dashboard': false,
    'budgeting': false,
    'projects': false,
    'reports': false,
    'brd': false,
    'api': false,
    'best-practices': false
  });
  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Mock documentation data
  const documentation = {
    'getting-started': [
      { title: 'Welcome to Hold My Budget', icon: <HelpIcon /> },
      { title: 'First-time Setup', icon: <SchoolIcon /> },
      { title: 'User Roles and Permissions', icon: <BusinessIcon /> },
      { title: 'Navigation Guide', icon: <ArrowForwardIcon /> }
    ],
    'dashboard': [
      { title: 'Understanding the Dashboard', icon: <TrendingUpIcon /> },
      { title: 'KPI Cards Explained', icon: <AccountBalanceIcon /> },
      { title: 'Charts and Visualizations', icon: <TrendingUpIcon /> },
      { title: 'Customizing Your View', icon: <AssignmentIcon /> }
    ],
    'budgeting': [
      { title: 'Creating a Budget', icon: <ReceiptIcon /> },
      { title: 'Budget Categories', icon: <AccountBalanceIcon /> },
      { title: 'Allocating Resources', icon: <AssignmentIcon /> },
      { title: 'Budget Approval Process', icon: <TrendingUpIcon /> }
    ],
    'projects': [
      { title: 'Project Management', icon: <AssignmentIcon /> },
      { title: 'Resource Allocation', icon: <AccountBalanceIcon /> },
      { title: 'Tracking Progress', icon: <TrendingUpIcon /> },
      { title: 'Project Reports', icon: <ReceiptIcon /> }
    ],
    'reports': [
      { title: 'Available Reports', icon: <ReceiptIcon /> },
      { title: 'Customizing Reports', icon: <AssignmentIcon /> },
      { title: 'Exporting Data', icon: <TrendingUpIcon /> },
      { title: 'Scheduled Reports', icon: <AccountBalanceIcon /> }
    ]
  };

  // Mock BRD sections
  const brdSections = [
    { title: 'Executive Summary', icon: <DescriptionIcon /> },
    { title: 'Project Objectives', icon: <DescriptionIcon /> },
    { title: 'Stakeholders', icon: <DescriptionIcon /> },
    { title: 'Functional Requirements', icon: <DescriptionIcon /> },
    { title: 'Non-Functional Requirements', icon: <DescriptionIcon /> },
    { title: 'Timeline and Milestones', icon: <DescriptionIcon /> },
    { title: 'Budget and Resources', icon: <DescriptionIcon /> },
    { title: 'Risks and Mitigation', icon: <DescriptionIcon /> }
  ];

  // Mock API documentation
  const apiDocs = [
    { title: 'Authentication', icon: <CodeIcon /> },
    { title: 'Budget API', icon: <CodeIcon /> },
    { title: 'Project API', icon: <CodeIcon /> },
    { title: 'Reports API', icon: <CodeIcon /> },
    { title: 'User Management API', icon: <CodeIcon /> }
  ];

  // Mock best practices
  const bestPractices = [
    { title: 'Budget Planning', icon: <LightbulbIcon /> },
    { title: 'Resource Allocation', icon: <LightbulbIcon /> },
    { title: 'Project Management', icon: <LightbulbIcon /> },
    { title: 'Reporting', icon: <LightbulbIcon /> },
    { title: 'Security', icon: <LightbulbIcon /> }
  ];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', m: 0, p: 0 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#217346',
            letterSpacing: '0.2px',
            mb: 1
          }}
        >
          Help & Resources
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            Dashboard
          </Link>
          <Typography color="text.primary">Help & Resources</Typography>
        </Breadcrumbs>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 3,
          border: `1px solid ${alpha('#217346', 0.08)}`,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha('#217346', 0.05)} 0%, ${alpha('#2E8555', 0.05)} 100%)`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha('#217346', 0.1),
              color: '#217346',
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            <HelpIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#217346' }}>
              How can we help you?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Find documentation, guides, and resources to help you use Hold My Budget effectively.
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="Search for help topics, guides, or documentation..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: alpha('#ffffff', 0.8),
              '&:hover': {
                backgroundColor: '#ffffff',
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha('#217346', 0.08)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  borderColor: alpha('#217346', 0.2),
                }
              }}
            >
              <CardActionArea sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      mb: 2,
                      width: 64,
                      height: 64
                    }}
                  >
                    <BookIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    User Guides
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Step-by-step guides to help you get started and master Budget Pro.
                  </Typography>
                  <Chip 
                    label="View Guides" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: alpha('#217346', 0.2),
                      }
                    }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha('#217346', 0.08)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  borderColor: alpha('#217346', 0.2),
                }
              }}
            >
              <CardActionArea sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      mb: 2,
                      width: 64,
                      height: 64
                    }}
                  >
                    <DescriptionIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    BRD
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Business Requirements Document detailing the system specifications and goals.
                  </Typography>
                  <Chip 
                    label="View BRD" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: alpha('#217346', 0.2),
                      }
                    }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha('#217346', 0.08)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  borderColor: alpha('#217346', 0.2),
                }
              }}
            >
              <CardActionArea sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      mb: 2,
                      width: 64,
                      height: 64
                    }}
                  >
                    <CodeIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    API Docs
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Technical documentation for integrating with the Budget Pro API.
                  </Typography>
                  <Chip 
                    label="View API Docs" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: alpha('#217346', 0.2),
                      }
                    }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha('#217346', 0.08)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  borderColor: alpha('#217346', 0.2),
                }
              }}
            >
              <CardActionArea 
                sx={{ height: '100%' }}
                onClick={() => navigate('/settings')}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      mb: 2,
                      width: 64,
                      height: 64
                    }}
                  >
                    <SettingsIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Configure your account preferences and application settings.
                  </Typography>
                  <Chip 
                    label="Go to Settings" 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha('#217346', 0.1),
                      color: '#217346',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: alpha('#217346', 0.2),
                      }
                    }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${alpha('#217346', 0.08)}`,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="help tabs"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 64,
                fontSize: '0.95rem',
              }
            }}
          >
            <Tab label="User Guides" icon={<BookIcon />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="BRD" icon={<DescriptionIcon />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="API Documentation" icon={<CodeIcon />} iconPosition="start" {...a11yProps(2)} />
            <Tab label="Best Practices" icon={<LightbulbIcon />} iconPosition="start" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.entries(documentation).map(([section, items]) => (
              <Paper 
                key={section}
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha('#217346', 0.08)}`,
                  overflow: 'hidden'
                }}
              >
                <ListItemButton 
                  onClick={() => toggleSection(section)}
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      backgroundColor: alpha('#217346', 0.04),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {section === 'getting-started' && <SchoolIcon color="primary" />}
                    {section === 'dashboard' && <TrendingUpIcon color="primary" />}
                    {section === 'budgeting' && <AccountBalanceIcon color="primary" />}
                    {section === 'projects' && <AssignmentIcon color="primary" />}
                    {section === 'reports' && <ReceiptIcon color="primary" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Typography>
                    } 
                  />
                  {openSections[section] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openSections[section]} timeout="auto" unmountOnExit>
                  <Divider />
                  <List component="div" disablePadding>
                    {items.map((item, index) => (
                      <ListItemButton 
                        key={index}
                        sx={{ 
                          pl: 4,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: alpha('#217346', 0.04),
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Paper>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {brdSections.map((section, index) => (
              <Paper 
                key={index}
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha('#217346', 0.08)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    borderColor: alpha('#217346', 0.2),
                  }
                }}
              >
                <ListItemButton 
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      backgroundColor: alpha('#217346', 0.04),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              </Paper>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {apiDocs.map((doc, index) => (
              <Paper 
                key={index}
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha('#217346', 0.08)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    borderColor: alpha('#217346', 0.2),
                  }
                }}
              >
                <ListItemButton 
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      backgroundColor: alpha('#217346', 0.04),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {doc.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {doc.title}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              </Paper>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {bestPractices.map((practice, index) => (
              <Paper 
                key={index}
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${alpha('#217346', 0.08)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    borderColor: alpha('#217346', 0.2),
                  }
                }}
              >
                <ListItemButton 
                  sx={{ 
                    py: 2,
                    '&:hover': {
                      backgroundColor: alpha('#217346', 0.04),
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {practice.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {practice.title}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              </Paper>
            ))}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}; 