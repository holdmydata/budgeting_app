import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  Container,
  LinearProgress,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useData } from '../context/DataContext';
import { Project } from '../types/data';

// Mock data for initial rendering
const mockProjectData: Project[] = [
  {
    id: "1",
    projectCode: "PRJ-001",
    projectName: "IT Infrastructure Upgrade",
    description: "Upgrade company IT infrastructure",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    budget: 300000,
    status: "active",
    managerId: "1",
    departmentId: "1",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01"
  },
  {
    id: "2",
    projectCode: "PRJ-002",
    projectName: "Marketing Campaign",
    description: "Q3 marketing campaign for new product",
    startDate: "2023-07-01",
    endDate: "2023-09-30",
    budget: 150000,
    status: "active",
    managerId: "2",
    departmentId: "2",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01"
  }
];

// Mock manager data
const mockManagers = {
  '1': 'John Smith',
  '2': 'Sarah Johnson',
  '3': 'Michael Brown'
};

// Format currency helper
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Column definition for the table
interface Column {
  id: keyof Project | 'budgetUsed' | 'managerName';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row?: Project) => React.ReactNode;
}

const columns: Column[] = [
  { id: 'projectCode', label: 'Project Code', minWidth: 120 },
  { id: 'projectName', label: 'Project Name', minWidth: 200 },
  { 
    id: 'status', 
    label: 'Status', 
    minWidth: 120,
    align: 'center',
    format: (value: Project['status']) => {
      let color, icon, label;
      
      switch(value) {
        case 'active':
          color = 'success';
          icon = <PlayCircleIcon fontSize="small" />;
          label = 'Active';
          break;
        case 'planned':
          color = 'info';
          icon = <CheckCircleIcon fontSize="small" />;
          label = 'Planned';
          break;
        case 'completed':
          color = 'default';
          icon = <CheckCircleIcon fontSize="small" />;
          label = 'Completed';
          break;
        case 'onHold':
          color = 'warning';
          icon = <PauseCircleIcon fontSize="small" />;
          label = 'On Hold';
          break;
        case 'cancelled':
          color = 'error';
          icon = <CancelIcon fontSize="small" />;
          label = 'Cancelled';
          break;
        default:
          color = 'default';
          label = value;
          break;
      }
      
      return (
        <Chip 
          icon={icon} 
          label={label} 
          color={color as any}
          size="small" 
          variant="outlined" 
        />
      );
    }
  },
  { 
    id: 'startDate', 
    label: 'Start Date', 
    minWidth: 120,
    format: (value: string) => new Date(value).toLocaleDateString()
  },
  { 
    id: 'endDate', 
    label: 'End Date', 
    minWidth: 120,
    format: (value: string) => new Date(value).toLocaleDateString()
  },
  { 
    id: 'budget', 
    label: 'Budget', 
    minWidth: 150,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  },
  { 
    id: 'budgetUsed', 
    label: 'Budget Used', 
    minWidth: 150,
    align: 'right',
    format: (_: any, row?: Project) => {
      if (!row) return '-';
      const used = row.budget * 0.75; // Mock usage as 75% of budget
      return formatCurrency(used);
    }
  },
  { 
    id: 'managerName', 
    label: 'Manager', 
    minWidth: 180,
    format: (_: any, row?: Project) => {
      if (!row) return '-';
      return mockManagers[row.managerId as keyof typeof mockManagers] || '-';
    }
  }
];

// Type for sorting order
type Order = 'asc' | 'desc';

// Status filter options
const statusFilters = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'onHold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' }
];

const ProjectsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoading } = useData();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Project>('projectName');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Project statistics
  const activeProjects = mockProjectData.filter(p => p.status === 'active').length;
  const completedProjects = mockProjectData.filter(p => p.status === 'completed').length;
  const totalBudget = mockProjectData.reduce((sum, project) => sum + project.budget, 0);
  const usedBudget = mockProjectData.reduce((sum, project) => {
    const usage = 0.75; // Mock usage as 75% of budget
    return sum + (project.budget * usage);
  }, 0);

  const handleRequestSort = (property: keyof Project) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Filter projects based on search query and status filter
  const filteredProjects = mockProjectData.filter((project) => {
    // Status filter
    if (statusFilter !== 'all' && project.status !== statusFilter) {
      return false;
    }

    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    return (
      project.projectCode.toLowerCase().includes(searchLower) ||
      project.projectName.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    );
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((projectA, projectB) => {
    const aValue = projectA[orderBy];
    const bValue = projectB[orderBy];
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    }
  });

  // Get current page of projects
  const displayedProjects = sortedProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            IT Projects
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your IT department's projects and budgets
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          sx={{ mt: isMobile ? 2 : 0 }}
        >
          New Project
        </Button>
      </Box>

      {/* Project Statistics Cards */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: 'repeat(4, 1fr)'
          },
          gap: 3,
          mb: 3
        }}
      >
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Active Projects
            </Typography>
            <Typography variant="h4" component="div" color="primary.main">
              {activeProjects}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h4" component="div" color="success.main">
              {completedProjects}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Budget
            </Typography>
            <Typography variant="h5" component="div">
              {totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Budget Used
            </Typography>
            <Typography variant="h5" component="div">
              {usedBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round((usedBudget / totalBudget) * 100)}% of total
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <LinearProgress />
        </Box>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search projects..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              {statusFilters.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Tooltip title="Additional filters">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table stickyHeader aria-label="projects table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.id === 'budgetUsed' || column.id === 'managerName' ? (
                      column.label
                    ) : (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id as keyof Project)}
                      >
                        {column.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedProjects.map((project) => (
                <TableRow 
                  hover 
                  role="checkbox" 
                  tabIndex={-1} 
                  key={project.id}
                  sx={{ cursor: 'pointer' }}
                >
                  {columns.map((column) => {
                    const value = column.id === 'budgetUsed' || column.id === 'managerName' 
                      ? null
                      : project[column.id as keyof Project];
                    
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value, project) : value || '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {displayedProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No projects matching search criteria' 
                      : 'No projects available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default ProjectsPage; 