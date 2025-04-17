import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { KPI } from '../types/data';
import { dataService } from '../services/dataService';

// Card background colors
const CARD_COLORS = [
  alpha('#217346', 0.08), // Light Green Primary
  alpha('#2E8555', 0.08), // Light Green Secondary
  alpha('#1A5D38', 0.08), // Light Green Tertiary
  alpha('#3C9F6A', 0.08)  // Light Green Quaternary
];

// Colors for pie chart
const COLORS = ['#217346', '#2E8555', '#3C9F6A', '#1A5D38', '#4DB380', '#68CCA0'];

// Define chart container
const ChartContainer = styled(Box)({
  width: '100%',
  minHeight: 300,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for charts
  const mockYieldData = [
    { month: 'Jan', planned: 250000, actual: 240000 },
    { month: 'Feb', planned: 300000, actual: 290000 },
    { month: 'Mar', planned: 280000, actual: 275000 },
    { month: 'Apr', planned: 310000, actual: 305000 },
    { month: 'May', planned: 340000, actual: 325000 },
    { month: 'Jun', planned: 290000, actual: 300000 }
  ];

  const budgetDistribution = [
    { name: 'Infrastructure', value: 1200000 },
    { name: 'Software', value: 800000 },
    { name: 'Services', value: 950000 },
    { name: 'Personnel', value: 650000 },
    { name: 'Other', value: 150000 }
  ];

  const mockSustainabilityData = [
    { name: 'ROI', A: 70, B: 65 },
    { name: 'Uptime', A: 99.9, B: 99.5 },
    { name: 'Response Time', A: 85, B: 75 },
    { name: 'Customer Sat', A: 90, B: 82 }
  ];

  const mockProjectData = [
    { name: 'ERP System', used: 450000, remaining: 150000 },
    { name: 'Network Infra', used: 380000, remaining: 120000 },
    { name: 'Cloud Migration', used: 275000, remaining: 225000 },
    { name: 'Security', used: 190000, remaining: 260000 }
  ];

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Load KPIs from data service
  useEffect(() => {
    console.log("Dashboard component mounted - attempting to load KPIs");
    
    const loadKPIs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching KPIs...");
        
        const data = await dataService.fetchKPIs();
        
        if (data && data.length > 0) {
          console.log("KPI data received:", data);
          setKpis(data);
        } else {
          console.log("No KPI data received");
          setError("No KPI data available");
        }
      } catch (err) {
        console.error("Error loading KPIs:", err);
        setError("Failed to load KPI data");
      } finally {
        setIsLoading(false);
      }
    };

    loadKPIs();
  }, []);

  // Function to render KPI cards
  const renderKpiCards = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    return kpis.map((kpi, index) => (
      <Card 
        key={kpi.id} 
        sx={{ 
          height: '100%',
          backgroundColor: CARD_COLORS[index % CARD_COLORS.length],
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${alpha('#217346', 0.08)}`,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          transform: 'translateY(0)',
          overflow: 'visible',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            borderColor: alpha('#217346', 0.15),
            '&::after': {
              opacity: 1,
            }
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-5px',
            left: '5%',
            width: '90%',
            height: '10px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            borderRadius: '50%',
            zIndex: -1,
          }
        }}
      >
        <CardContent sx={{ 
          p: 2,
          '&:last-child': { 
            pb: 2
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 1,
          }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 600,
                letterSpacing: '0.3px',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
              }}
            >
              {kpi.title}
            </Typography>
            <Box sx={{ 
              color: '#217346',
              display: 'flex',
              p: 0.5,
              borderRadius: '50%',
              bgcolor: alpha('#217346', 0.1),
              boxShadow: `0 2px 8px ${alpha('#217346', 0.15)}`,
            }}>
              {kpi.icon}
            </Box>
          </Box>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: '#217346',
              letterSpacing: '0.2px',
              mt: 1,
              fontSize: '1.75rem',
              textShadow: '0 1px 1px rgba(0,0,0,0.05)'
            }}
          >
            {kpi.formattedValue}
          </Typography>
          {kpi.secondaryValue && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                letterSpacing: '0.3px',
                mt: 0.5,
                fontWeight: 500,
                fontSize: '0.85rem',
                opacity: 0.85
              }}
            >
              {kpi.secondaryValue}
            </Typography>
          )}
        </CardContent>
      </Card>
    ));
  };

  return (
    <Box 
      className="dashboard-container"
      sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 1.5,
        pl: { xs: 1.5, sm: 2 },
        pr: { xs: 1.5, sm: 2 },
        m: 0,
        ml: 0,
        mr: 0,
        bgcolor: 'transparent',
        borderRadius: 0,
        boxShadow: 'none',
        position: 'relative',
        zIndex: 1,
        overflow: 'auto'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 1.5,
          fontWeight: 600,
          color: '#217346',
          fontSize: '1.75rem',
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            display: 'inline-block',
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: '#217346',
            marginRight: '12px',
          }
        }}
      >
        Dashboard
      </Typography>

      {/* Debug information - will be visible if content is loading */}
      {isLoading && (
        <Box sx={{ p: 1.5, bgcolor: 'info.main', color: 'white', borderRadius: 1, mb: 1.5 }}>
          Loading dashboard data...
        </Box>
      )}

      {/* Ensure KPI cards are visible */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: { xs: 1.5, sm: 2 },
          mb: 2,
          width: '100%'
        }}
      >
        {kpis.length > 0 ? renderKpiCards() : (
          <Typography color="text.secondary">No KPI data available</Typography>
        )}
      </Box>

      {/* Charts Section */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr'
          },
          gap: 2,
          width: '100%',
          mb: 2
        }}
      >
        {/* First row of charts */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: '12px',
            border: `1px solid ${alpha('#217346', 0.08)}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              borderColor: alpha('#217346', 0.15),
              '&::after': {
                opacity: 1,
              }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-5px',
              left: '5%',
              width: '90%',
              height: '10px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              borderRadius: '50%',
              zIndex: -1
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: '#217346',
              mb: 2,
              letterSpacing: '0.3px',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
            }}
          >
            Planned vs Actual IT Spending (Monthly)
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            {/* @ts-ignore - Ignoring type issues with ResponsiveContainer */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockYieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#217346" />
                <Bar dataKey="actual" fill="#2E8555" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* IT Budget Distribution */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: '12px',
            border: `1px solid ${alpha('#217346', 0.08)}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              borderColor: alpha('#217346', 0.15),
              '&::after': {
                opacity: 1,
              }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-5px',
              left: '5%',
              width: '90%',
              height: '10px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              borderRadius: '50%',
              zIndex: -1
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: '#217346',
              mb: 2,
              letterSpacing: '0.3px',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
            }}
          >
            IT Budget Distribution
          </Typography>
          <ChartContainer>
            {/* @ts-ignore - Ignoring type issues with ResponsiveContainer */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {budgetDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Paper>
      </Box>

      {/* Second row of charts */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)'
          },
          gap: 2,
          width: '100%',
          mb: 2
        }}
      >
        {/* IT Performance Metrics */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3,
            borderRadius: '12px',
            border: `1px solid ${alpha('#217346', 0.08)}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              borderColor: alpha('#217346', 0.15),
              '&::after': {
                opacity: 1,
              }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-5px',
              left: '5%',
              width: '90%',
              height: '10px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              borderRadius: '50%',
              zIndex: -1
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: '#217346',
              mb: 2,
              letterSpacing: '0.3px',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
            }}
          >
            IT Performance Metrics
          </Typography>
          <ChartContainer>
            {/* @ts-ignore - Ignoring type issues with ResponsiveContainer */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockSustainabilityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="A" fill="#217346" name="Current Year" />
                <Bar dataKey="B" fill="#3C9F6A" name="Previous Year" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Paper>

        {/* Project Budget Utilization */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3,
            borderRadius: '12px',
            border: `1px solid ${alpha('#217346', 0.08)}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              borderColor: alpha('#217346', 0.15),
              '&::after': {
                opacity: 1,
              }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-5px',
              left: '5%',
              width: '90%',
              height: '10px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              borderRadius: '50%',
              zIndex: -1
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: '#217346',
              mb: 2,
              letterSpacing: '0.3px',
              fontSize: '1.1rem',
              textTransform: 'uppercase',
            }}
          >
            Project Budget Utilization
          </Typography>
          <ChartContainer>
            {/* @ts-ignore - Ignoring type issues with ResponsiveContainer */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockProjectData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="used" stackId="a" fill="#217346" name="Used" />
                <Bar dataKey="remaining" stackId="a" fill="#3C9F6A" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;