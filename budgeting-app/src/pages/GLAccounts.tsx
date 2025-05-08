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
  TablePagination,
  TableRow,
  alpha,
  Alert,
  LinearProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { GLAccount } from '../types/data';
import { useData } from '../context/DataContext';
import GLAccountDetailsModal from '../modals/GLAccountDetailsModal';

// Column definition for the table
interface Column {
  id: keyof GLAccount;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
}

const columns: Column[] = [
  { id: 'accountNumber', label: 'Account Number', minWidth: 120 },
  { id: 'accountName', label: 'Account Name', minWidth: 200 },
  { id: 'accountType', label: 'Account Type', minWidth: 120 },
  { 
    id: 'isActive', 
    label: 'Status', 
    minWidth: 100,
    format: (value: boolean) => (
      <Box
        sx={{
          display: 'inline-block',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          backgroundColor: value 
            ? (theme) => alpha(theme.palette.success.main, 0.1)
            : (theme) => alpha(theme.palette.error.main, 0.1),
          color: value 
            ? (theme) => theme.palette.success.main
            : (theme) => theme.palette.error.main,
          fontWeight: 500,
        }}
      >
        {value ? 'Active' : 'Inactive'}
      </Box>
    )
  },
  { 
    id: 'validFrom', 
    label: 'Valid From', 
    minWidth: 120,
    format: (value: string) => new Date(value).toLocaleDateString()
  },
  { 
    id: 'validTo', 
    label: 'Valid To', 
    minWidth: 120,
    format: (value: string | null) => value ? new Date(value).toLocaleDateString() : 'Current'
  }
];

// Account type filter options
const accountTypeFilters = [
  { value: 'all', label: 'All Types' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' }
];

export const GLAccounts: React.FC = () => {
  const { isLoading, fetchGLAccounts } = useData();
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedGLAccount, setSelectedGLAccount] = useState<GLAccount | null>(null);

  // Fetch GL accounts when filters change
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setError(null);
        const filters: Record<string, any> = {
          isCurrent: true // Only show current versions by default
        };

        // Add account type filter
        if (accountTypeFilter !== 'all') {
          filters.accountType = accountTypeFilter;
        }

        // Add search filter
        if (searchQuery) {
          filters.search = searchQuery;
        }

        const data = await fetchGLAccounts(filters);
        setGLAccounts(data);
      } catch (err) {
        console.error('Error fetching GL accounts:', err);
        setError('Failed to load GL accounts. Please try again later.');
      }
    };

    loadAccounts();
  }, [fetchGLAccounts, accountTypeFilter, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleAccountTypeFilterChange = (event: SelectChangeEvent) => {
    setAccountTypeFilter(event.target.value);
    setPage(0);
  };

  // Apply pagination
  const paginatedAccounts = glAccounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handler for row click
  const handleRowClick = (account: GLAccount) => {
    setSelectedGLAccount(account);
    setOpenDetailsModal(true);
  };

  const handleDetailsModalClose = () => {
    setOpenDetailsModal(false);
    setSelectedGLAccount(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            GL Accounts
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your general ledger accounts and chart of accounts
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
        >
          New Account
        </Button>
      </Box>

      <Paper 
        sx={{ 
          overflow: 'hidden',
          boxShadow: 'none',
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.1),
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search accounts..."
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
            <InputLabel id="account-type-filter-label">Account Type</InputLabel>
            <Select
              labelId="account-type-filter-label"
              value={accountTypeFilter}
              label="Account Type"
              onChange={handleAccountTypeFilterChange}
            >
              {accountTypeFilters.map((option) => (
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAccounts.map((account) => (
                <TableRow
                  key={account.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(account)}
                >
                  {columns.map((column) => {
                    const value = account[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : value || '-'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {paginatedAccounts.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    {searchQuery || accountTypeFilter !== 'all'
                      ? 'No accounts matching search criteria'
                      : 'No accounts available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={glAccounts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* GL Account Details Modal */}
      <GLAccountDetailsModal
        open={openDetailsModal}
        onClose={handleDetailsModalClose}
        glAccount={selectedGLAccount}
      />
    </Box>
  );
}; 