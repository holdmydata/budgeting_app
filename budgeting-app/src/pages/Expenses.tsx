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
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { useData } from '../context/DataContext';
import { FinancialTransaction } from '../types/data';

// Mock data for initial rendering
const mockTransactions: FinancialTransaction[] = [
  {
    id: '1',
    transactionDate: '2023-03-15T00:00:00Z',
    glAccountId: '1',
    projectId: '2',
    amount: 2999.99,
    description: 'Software licenses renewal',
    reference: 'INV-5678',
    vendorId: '1',
    userId: 'user-1',
    dateId: 'date-1',
    createdAt: '2023-03-15T10:30:00Z',
    updatedAt: '2023-03-15T10:30:00Z'
  },
  {
    id: '2',
    transactionDate: '2023-03-10T00:00:00Z',
    glAccountId: '2',
    projectId: '1',
    amount: 1499.95,
    description: 'New laptops purchase',
    reference: 'PO-1234',
    vendorId: '3',
    userId: 'user-2',
    dateId: 'date-2',
    createdAt: '2023-03-10T14:20:00Z',
    updatedAt: '2023-03-10T14:20:00Z'
  },
  {
    id: '3',
    transactionDate: '2023-03-05T00:00:00Z',
    glAccountId: '3',
    amount: 399.00,
    description: 'Cloud storage subscription',
    reference: 'SUB-9876',
    vendorId: '2',
    userId: 'user-1',
    dateId: 'date-3',
    createdAt: '2023-03-05T09:15:00Z',
    updatedAt: '2023-03-05T09:15:00Z'
  },
  {
    id: '4',
    transactionDate: '2023-03-01T00:00:00Z',
    glAccountId: '4',
    projectId: '3',
    amount: 5000.00,
    description: 'IT Consulting services',
    reference: 'INV-4321',
    vendorId: '4',
    userId: 'user-3',
    dateId: 'date-4',
    createdAt: '2023-03-01T11:45:00Z',
    updatedAt: '2023-03-01T11:45:00Z'
  },
  {
    id: '5',
    transactionDate: '2023-02-28T00:00:00Z',
    glAccountId: '5',
    amount: 1200.00,
    description: 'Staff training program',
    reference: 'INV-8765',
    vendorId: '5',
    userId: 'user-2',
    dateId: 'date-5',
    createdAt: '2023-02-28T16:30:00Z',
    updatedAt: '2023-02-28T16:30:00Z'
  },
  {
    id: '6',
    transactionDate: '2023-02-20T00:00:00Z',
    glAccountId: '6',
    projectId: '2',
    amount: 850.50,
    description: 'Network maintenance',
    reference: 'SVC-2468',
    vendorId: '5',
    userId: 'user-1',
    dateId: 'date-6',
    createdAt: '2023-02-20T13:10:00Z',
    updatedAt: '2023-02-20T13:10:00Z'
  },
  {
    id: '7',
    transactionDate: '2023-02-15T00:00:00Z',
    glAccountId: '7',
    projectId: '1',
    amount: 3499.99,
    description: 'Server hardware upgrade',
    reference: 'PO-3579',
    vendorId: '3',
    userId: 'user-3',
    dateId: 'date-7',
    createdAt: '2023-02-15T10:45:00Z',
    updatedAt: '2023-02-15T10:45:00Z'
  }
];

// Mock lookup data for GL Accounts and Projects
const mockGLAccounts = {
  '1': 'IT Software Licenses',
  '2': 'IT Hardware',
  '3': 'IT Cloud Services',
  '4': 'IT Consulting',
  '5': 'IT Training',
  '6': 'IT Support Services',
  '7': 'Network Infrastructure',
  '8': 'Data Center Equipment'
};

const mockProjects = {
  '1': 'ERP Implementation',
  '2': 'Network Upgrade',
  '3': 'Data Migration'
};

const mockVendors = {
  '1': 'Acme Tech Solutions',
  '2': 'DataSphere Inc.',
  '3': 'AgriTech Hardware Co.',
  '4': 'FarmSys Consulting',
  '5': 'Network Solutions Ltd.'
};

// Column definition for the table
interface Column {
  id: keyof FinancialTransaction | 'glAccountName' | 'projectName' | 'vendorName';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: FinancialTransaction) => React.ReactNode;
}

const columns: Column[] = [
  { 
    id: 'transactionDate', 
    label: 'Date', 
    minWidth: 120,
    format: (value: string) => new Date(value).toLocaleDateString()
  },
  { 
    id: 'glAccountName', 
    label: 'GL Account',
    minWidth: 180,
    format: (_: string, row: FinancialTransaction) => mockGLAccounts[row.glAccountId as keyof typeof mockGLAccounts] || '-'
  },
  { 
    id: 'projectName', 
    label: 'Project',
    minWidth: 160,
    format: (_: string, row: FinancialTransaction) => row.projectId ? mockProjects[row.projectId as keyof typeof mockProjects] || '-' : '-'
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
    id: 'reference', 
    label: 'Reference', 
    minWidth: 120 
  },
  { 
    id: 'vendorName', 
    label: 'Vendor',
    minWidth: 180,
    format: (_: string, row: FinancialTransaction) => row.vendorId ? mockVendors[row.vendorId as keyof typeof mockVendors] || '-' : '-'
  }
];

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
  const { isLoading } = useData();
  
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockTransactions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof FinancialTransaction>('transactionDate');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    // In a real app, we would fetch transactions from API
    // For now, using mock data
    setTransactions(mockTransactions);
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

  // Apply date filter
  const getFilteredByDate = (data: FinancialTransaction[]): FinancialTransaction[] => {
    if (dateFilter === 'all') return data;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
    
    return data.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate);
      
      switch (dateFilter) {
        case 'current-month':
          return transactionDate >= startOfMonth;
        case 'last-month':
          return transactionDate >= startOfLastMonth && transactionDate < startOfMonth;
        case 'last-quarter':
          return transactionDate >= startOfQuarter;
        case 'ytd':
          return transactionDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  // Filter transactions based on search query and date filter
  const filteredTransactions = getFilteredByDate(transactions).filter((transaction) => {
    const searchText = searchQuery.toLowerCase();
    const glAccountName = mockGLAccounts[transaction.glAccountId as keyof typeof mockGLAccounts] || '';
    const projectName = transaction.projectId 
      ? mockProjects[transaction.projectId as keyof typeof mockProjects] || ''
      : '';
    const vendorName = transaction.vendorId
      ? mockVendors[transaction.vendorId as keyof typeof mockVendors] || ''
      : '';
      
    return (
      glAccountName.toLowerCase().includes(searchText) ||
      projectName.toLowerCase().includes(searchText) ||
      transaction.description.toLowerCase().includes(searchText) ||
      transaction.reference.toLowerCase().includes(searchText) ||
      vendorName.toLowerCase().includes(searchText)
    );
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const isAsc = order === 'asc';
    
    if (orderBy === 'transactionDate' || orderBy === 'createdAt' || orderBy === 'updatedAt') {
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
              {paginatedTransactions.length === 0 && (
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
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default ExpensesPage; 