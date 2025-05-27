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
  Tooltip,
  Container,
  LinearProgress,
  Button,
  useTheme,
  useMediaQuery,
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
import DownloadIcon from '@mui/icons-material/Download';
import { useData } from '../../context/DataContext';
import { FinancialTransaction } from '../../types/data';
import { dataService } from '../../services/dataService';
import ExpenseFormModal from '../../modals/ExpenseFormModal';

// Type for sorting order
type Order = 'asc' | 'desc';

// Date range filter options
const dateFilters = [
  { value: 'all', label: 'All Dates' },
  { value: 'current-month', label: 'Current Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-quarter', label: 'Last Quarter' },
  { value: 'ytd', label: 'Year to Date' }
];

export const ExpensesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLoading, fetchTransactions, addTransaction, updateTransaction } = useData();
  
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof FinancialTransaction>('date');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [glAccountLookup, setGLAccountLookup] = useState<Record<string, string>>({});
  const [projectLookup, setProjectLookup] = useState<Record<string, string>>({});
  const [vendorLookup, setVendorLookup] = useState<Record<string, string>>({});
  const [isLookupsLoading, setIsLookupsLoading] = useState(true);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  // Column definition for the table
  interface Column {
    id: keyof FinancialTransaction | 'glAccountName' | 'projectName' | 'vendorName';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left' | 'center';
    format?: (value: any, row: FinancialTransaction) => React.ReactNode;
  }

  // Fetch transactions when filters change
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setError(null);
        const filters: Record<string, any> = {};
        
        // Add date filter
        if (dateFilter !== 'all') {
          const now = new Date();
          switch (dateFilter) {
            case 'current-month':
              filters.fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
              break;
            case 'last-month':
              filters.fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
              filters.toDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
              break;
            case 'last-quarter':
              filters.fromDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1).toISOString();
              break;
            case 'ytd':
              filters.fromDate = new Date(now.getFullYear(), 0, 1).toISOString();
              break;
          }
        }

        // Add search filter if present
        if (searchQuery) {
          filters.search = searchQuery;
        }

        const data = await fetchTransactions(filters);
        setTransactions(data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      }
    };

    loadTransactions();
  }, [fetchTransactions, dateFilter, searchQuery]);

  useEffect(() => {
    setIsLookupsLoading(true);
    setLookupsError(null);
    Promise.all([
      dataService.fetchGLAccountLookup?.(),
      dataService.fetchProjectLookup?.(),
      dataService.fetchVendorLookup?.()
    ])
      .then(([gl, proj, vend]) => {
        setGLAccountLookup(gl || {});
        setProjectLookup(proj || {});
        setVendorLookup(vend || {});
      })
      .catch(() => setLookupsError('Failed to load lookup data'))
      .finally(() => setIsLookupsLoading(false));
  }, []);

  const handleRequestSort = (property: keyof FinancialTransaction) => {
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

  const handleDateFilterChange = (event: SelectChangeEvent) => {
    setDateFilter(event.target.value);
    setPage(0);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedTransaction(null);
  };
  
  // Handler for modal submit (add/edit)
  const handleModalSubmit = async (data: any) => {
    try {
      if (modalMode === 'add') {
        await addTransaction(data);
      } else if (modalMode === 'edit' && selectedTransaction) {
        await updateTransaction(data);
      }
      setOpenModal(false);
      setSelectedTransaction(null);
      // Refresh transactions
      const refreshed = await fetchTransactions();
      setTransactions(refreshed);
    } catch (err) {
      setError('Failed to save expense. Please try again.');
    }
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    const isAsc = order === 'asc';
    
    if (orderBy === 'date' || orderBy === 'createdAt' || orderBy === 'updatedAt') {
      return isAsc 
        ? new Date(a[orderBy]).getTime() - new Date(b[orderBy]).getTime()
        : new Date(b[orderBy]).getTime() - new Date(a[orderBy]).getTime();
    } 
    
    if (orderBy === 'amount') {
      return isAsc ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    }
    
    // Default string comparison
    const aValue = String(a[orderBy] || '');
    const bValue = String(b[orderBy] || '');
    return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  // Apply pagination
  const paginatedTransactions = sortedTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Show loading or error for lookups
  if (isLookupsLoading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><LinearProgress /><Typography>Loading lookup data...</Typography></Box>;
  }
  if (lookupsError) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Alert severity="error">{lookupsError}</Alert></Box>;
  }

  const columns: Column[] = [
    { 
      id: 'date', 
      label: 'Date', 
      minWidth: 120,
      format: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      id: 'glAccountName', 
      label: 'GL Account',
      minWidth: 180,
      format: (_: string, row: FinancialTransaction) => glAccountLookup[row.glAccount] || '-'
    },
    { 
      id: 'projectName', 
      label: 'Project',
      minWidth: 160,
      format: (_: string, row: FinancialTransaction) => projectLookup[row.project] || '-'
    },
    { 
      id: 'description', 
      label: 'Description', 
      minWidth: 200 
    },
    { 
      id: 'amount', 
      label: 'Amount', 
      minWidth: 120,
      align: 'right',
      format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { 
      id: 'voucherNumber', 
      label: 'Reference', 
      minWidth: 120 
    },
    { 
      id: 'vendorName', 
      label: 'Vendor',
      minWidth: 180,
      format: (_: string, row: FinancialTransaction) => vendorLookup[row.vendor] || '-'
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => value
    }
  ];

  return (
    <Container maxWidth={false} sx={{ mt: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Expenses
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track and manage IT expenses and financial transactions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: isMobile ? 2 : 0 }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            size={isMobile ? 'small' : 'medium'}
          >
            Export
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            size={isMobile ? 'small' : 'medium'}
            onClick={() => {
              setSelectedTransaction(null);
              setOpenModal(true);
              setModalMode('add');
            }}
          >
            New Expense
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search expenses..."
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
            <InputLabel id="date-filter-label">Date Range</InputLabel>
            <Select
              labelId="date-filter-label"
              value={dateFilter}
              label="Date Range"
              onChange={handleDateFilterChange}
            >
              {dateFilters.map((option) => (
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

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {isLoading && <LinearProgress />}

        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="expenses table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.id === 'glAccountName' || column.id === 'projectName' || column.id === 'vendorName' ? (
                      column.label
                    ) : (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id as keyof FinancialTransaction)}
                      >
                        {column.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow 
                  hover 
                  role="checkbox" 
                  tabIndex={-1} 
                  key={transaction.id}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setModalMode('edit');
                    setOpenModal(true);
                  }}
                >
                  {columns.map((column) => {
                    const value = transaction[column.id as keyof FinancialTransaction];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format 
                          ? column.format(value, transaction) 
                          : value || '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {paginatedTransactions.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    {searchQuery || dateFilter !== 'all' 
                      ? 'No expenses matching search criteria' 
                      : 'No expenses available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Expense Add/Edit Modal */}
      <ExpenseFormModal
        open={openModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={selectedTransaction}
        mode={modalMode}
      />
    </Container>
  );
};

export default ExpensesPage; 