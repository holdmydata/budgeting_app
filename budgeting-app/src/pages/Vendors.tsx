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
  Rating,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { useData } from '../context/DataContext';
import { Vendor } from '../types/data';

// Mock data for initial rendering
const mockVendors: Vendor[] = [
  {
    id: '1',
    vendorName: 'Acme Tech Solutions',
    vendorCode: 'VEN-001',
    contactName: 'John Smith',
    contactEmail: 'john@acmetech.com',
    contactPhone: '(555) 123-4567',
    category: 'Software',
    performanceScore: 4.5,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z'
  },
  {
    id: '2',
    vendorName: 'DataSphere Inc.',
    vendorCode: 'VEN-002',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@datasphere.com',
    contactPhone: '(555) 987-6543',
    category: 'Cloud Services',
    performanceScore: 5.0,
    isActive: true,
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z'
  },
  {
    id: '3',
    vendorName: 'AgriTech Hardware Co.',
    vendorCode: 'VEN-003',
    contactName: 'Michael Brown',
    contactEmail: 'michael@agritech.com',
    contactPhone: '(555) 234-5678',
    category: 'Hardware',
    performanceScore: 3.8,
    isActive: true,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-02-20T00:00:00Z'
  },
  {
    id: '4',
    vendorName: 'FarmSys Consulting',
    vendorCode: 'VEN-004',
    contactName: 'Emily Davis',
    contactEmail: 'emily@farmsys.com',
    contactPhone: '(555) 345-6789',
    category: 'Consulting',
    performanceScore: 4.2,
    isActive: true,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-03-15T00:00:00Z'
  },
  {
    id: '5',
    vendorName: 'Network Solutions Ltd.',
    vendorCode: 'VEN-005',
    contactName: 'Robert Wilson',
    contactEmail: 'robert@networksol.com',
    contactPhone: '(555) 456-7890',
    category: 'Network',
    performanceScore: 4.0,
    isActive: false,
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2023-02-25T00:00:00Z'
  },
  {
    id: '6',
    vendorName: 'Security Pro Partners',
    vendorCode: 'VEN-006',
    contactName: 'Amanda Martinez',
    contactEmail: 'amanda@securitypro.com',
    contactPhone: '(555) 567-8901',
    category: 'Security',
    performanceScore: 4.7,
    isActive: true,
    createdAt: '2023-01-25T00:00:00Z',
    updatedAt: '2023-03-20T00:00:00Z'
  }
];

// Column definition for the table
interface Column {
  id: keyof Vendor;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
}

const columns: Column[] = [
  { id: 'vendorCode', label: 'Vendor Code', minWidth: 120 },
  { id: 'vendorName', label: 'Vendor Name', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 150 },
  { id: 'contactName', label: 'Contact Person', minWidth: 180 },
  { id: 'contactEmail', label: 'Email', minWidth: 200 },
  { 
    id: 'performanceScore', 
    label: 'Rating', 
    minWidth: 150,
    align: 'center',
    format: (value: number) => (
      <Rating 
        value={value} 
        precision={0.5} 
        readOnly 
        size="small"
      />
    )
  },
  { 
    id: 'isActive', 
    label: 'Status', 
    minWidth: 120,
    align: 'center',
    format: (value: boolean) => (
      <Chip 
        label={value ? 'Active' : 'Inactive'} 
        color={value ? 'success' : 'error'} 
        variant="outlined"
        size="small" 
      />
    )
  }
];

// Type for sorting order
type Order = 'asc' | 'desc';

export const Vendors: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoading } = useData();
  
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Vendor>('vendorName');

  useEffect(() => {
    // In a real app, we would fetch vendors from API
    // For now, using mock data
    setVendors(mockVendors);
  }, []);

  const handleRequestSort = (property: keyof Vendor) => {
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

  // Filter vendors based on search query
  const filteredVendors = vendors.filter((vendor) => {
    const searchText = searchQuery.toLowerCase();
    return (
      (vendor.vendorName && vendor.vendorName.toLowerCase().includes(searchText)) ||
      (vendor.vendorCode && vendor.vendorCode.toLowerCase().includes(searchText)) ||
      (vendor.category && vendor.category.toLowerCase().includes(searchText)) ||
      (vendor.contactName && vendor.contactName.toLowerCase().includes(searchText)) ||
      (vendor.contactEmail && vendor.contactEmail.toLowerCase().includes(searchText))
    );
  });

  // Sort vendors
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    const isAsc = order === 'asc';
    
    // Handle string comparisons
    if (
      orderBy === 'vendorName' || 
      orderBy === 'vendorCode' || 
      orderBy === 'category' || 
      orderBy === 'contactName' || 
      orderBy === 'contactEmail' || 
      orderBy === 'contactPhone'
    ) {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      return isAsc 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } 
    // Handle numeric comparisons (performance score)
    else if (orderBy === 'performanceScore') {
      const aValue = a[orderBy] || 0;
      const bValue = b[orderBy] || 0;
      return isAsc ? aValue - bValue : bValue - aValue;
    } 
    // Handle boolean comparisons (isActive)
    else if (orderBy === 'isActive') {
      return isAsc 
        ? (a[orderBy] === b[orderBy] ? 0 : a[orderBy] ? -1 : 1)
        : (a[orderBy] === b[orderBy] ? 0 : a[orderBy] ? 1 : -1);
    }
    // Handle date comparisons
    else if (orderBy === 'createdAt' || orderBy === 'updatedAt') {
      return isAsc 
        ? new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime()
        : new Date(b[orderBy]).getTime() - new Date(a[orderBy]).getTime();
    }
    
    return 0;
  });

  // Apply pagination
  const paginatedVendors = sortedVendors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth={false} sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Vendors
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your IT service providers and suppliers
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          sx={{ mt: isMobile ? 2 : 0 }}
        >
          Add Vendor
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search vendors..."
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
          <Tooltip title="Additional filters">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {isLoading && <LinearProgress />}

        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="vendors table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVendors.map((vendor) => (
                <TableRow 
                  hover 
                  role="checkbox" 
                  tabIndex={-1} 
                  key={vendor.id}
                  sx={{ cursor: 'pointer' }}
                >
                  {columns.map((column) => {
                    const value = vendor[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : value || '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {paginatedVendors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    {searchQuery ? 'No vendors matching search criteria' : 'No vendors available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredVendors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default Vendors; 