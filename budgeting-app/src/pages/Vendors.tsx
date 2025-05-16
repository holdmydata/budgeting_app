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
  useMediaQuery,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { useData } from '../context/DataContext';
import { Vendor } from '../types/data';
import { dataService } from '../services/dataService';
import VendorFormModal from '../modals/VendorFormModal';



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
  const { isLoading, addVendor, updateVendor } = useData();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Vendor>('vendorName');
  const [openModal, setOpenModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingVendors(true);
    setVendorsError(null);
    dataService.fetchVendors?.()
      .then((data: Vendor[]) => setVendors(data))
      .catch(() => setVendorsError('Failed to load vendors'))
      .finally(() => setIsLoadingVendors(false));
  }, []);

  // Handler for modal submit (add/edit)
  const handleModalSubmit = async (data: any) => {
    try {
      if (modalMode === 'add') {
        await addVendor(data);
      } else if (modalMode === 'edit' && selectedVendor) {
        await updateVendor(data);
      }
      setOpenModal(false);
      setSelectedVendor(null);
      // Refresh vendors
      setIsLoadingVendors(true);
      setVendorsError(null);
      dataService.fetchVendors?.()
        .then((data: Vendor[]) => setVendors(data))
        .catch(() => setVendorsError('Failed to load vendors'))
        .finally(() => setIsLoadingVendors(false));
    } catch (err) {
      setError('Failed to save vendor. Please try again.');
    }
  };

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

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedVendor(null);
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
          onClick={() => {
            setSelectedVendor(null);
            setModalMode('add');
            setOpenModal(true);
          }}
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

        {isLoadingVendors ? <LinearProgress /> : null}
        {vendorsError && <Alert severity="error">{vendorsError}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

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
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setModalMode('edit');
                    setOpenModal(true);
                  }}
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
      {/* Vendor Add/Edit Modal */}
      <VendorFormModal
        open={openModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={selectedVendor}
        mode={modalMode}
      />
    </Container>
  );
};

export default Vendors; 