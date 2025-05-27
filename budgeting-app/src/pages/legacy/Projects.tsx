import React, { useState, useEffect } from 'react';
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
  SelectChangeEvent,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import EditIcon from '@mui/icons-material/Edit';
import { useData } from '../../context/DataContext';
import { Project } from '../../types/data';
import ProjectFormModal from '../../modals/ProjectFormModal';

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
        case 'Planned':
          color = 'info';
          icon = <PlayCircleIcon fontSize="small" />;
          label = 'Planned';
          break;
        case 'In Progress':
          color = 'success';
          icon = <CheckCircleIcon fontSize="small" />;
          label = 'In Progress';
          break;
        case 'Completed':
          color = 'default';
          icon = <CheckCircleIcon fontSize="small" />;
          label = 'Completed';
          break;
        case 'On Hold':
          color = 'warning';
          icon = <PauseCircleIcon fontSize="small" />;
          label = 'On Hold';
          break;
        case 'Cancelled':
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
    format: (value: number) => formatCurrency(value)
  },
  { 
    id: 'spent', 
    label: 'Spent', 
    minWidth: 150,
    align: 'right',
    format: (value: number) => formatCurrency(value)
  },
  { 
    id: 'owner', 
    label: 'Manager', 
    minWidth: 180
  }
];

// Type for sorting order
type Order = 'asc' | 'desc';

// Status filter options
const statusFilters = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Planned', label: 'Planned' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Cancelled', label: 'Cancelled' }
];

const ProjectsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoading, fetchProjects, addProject, updateProject } = useData();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Project>('projectName');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openModal, setOpenModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Fetch projects when filters change
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setError(null);
        const filters: Record<string, any> = {};
        
        // Add status filter
        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }

        // Add search filter
        if (searchQuery) {
          filters.search = searchQuery;
        }

        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      }
    };

    loadProjects();
  }, [fetchProjects, statusFilter, searchQuery]);

  // Calculate statistics from current data
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);

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

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    const isAsc = order === 'asc';
    
    if (orderBy === 'startDate' || orderBy === 'endDate' || orderBy === 'createdAt' || orderBy === 'updatedAt') {
      return isAsc 
        ? new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime()
        : new Date(b[orderBy]).getTime() - new Date(a[orderBy]).getTime();
    } 
    
    if (orderBy === 'budget' || orderBy === 'spent') {
      return isAsc ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    }
    
    // Default string comparison
    const aValue = String(a[orderBy] || '');
    const bValue = String(b[orderBy] || '');
    return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  // Get current page of projects
  const displayedProjects = sortedProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handler for Add button
  const handleAdd = () => {
    setSelectedProject(null);
    setModalMode('add');
    setOpenModal(true);
  };

  // Handler for Edit button
  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setModalMode('edit');
    setOpenModal(true);
  };

  // Handler for modal submit
  const handleModalSubmit = async (data: any) => {
    try {
      if (modalMode === 'add') {
        await addProject(data);
      } else if (modalMode === 'edit' && selectedProject) {
        await updateProject(data);
      }
      setOpenModal(false);
      // Refresh projects
      const refreshed = await fetchProjects();
      setProjects(refreshed);
    } catch (err) {
      setError('Failed to save project. Please try again.');
    }
  };

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
          onClick={handleAdd}
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
              {formatCurrency(totalBudget)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Budget Used
            </Typography>
            <Typography variant="h5" component="div">
              {formatCurrency(totalSpent)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% of total
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

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
                    const value = project[column.id as keyof Project];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value, project) : value || '-'}
                      </TableCell>
                    );
                  })}
                  {/* Edit button cell */}
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(project)} size="small" aria-label="Edit project">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {displayedProjects.length === 0 && !isLoading && (
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
          count={sortedProjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Project Add/Edit Modal */}
      <ProjectFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedProject}
        mode={modalMode}
      />
    </Container>
  );
};

export default ProjectsPage; 