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
  TablePagination,
  TableRow,
  alpha,
} from '@mui/material';
import { GLAccount } from '../types/data';

// Mock data for GL accounts
const mockAccounts: GLAccount[] = [
  {
    id: '1',
    accountNumber: '1000',
    accountName: 'Cash and Cash Equivalents',
    accountType: 'Asset',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    accountNumber: '2000',
    accountName: 'Accounts Receivable',
    accountType: 'Asset',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    accountNumber: '3000',
    accountName: 'Inventory',
    accountType: 'Asset',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    accountNumber: '4000',
    accountName: 'Accounts Payable',
    accountType: 'Liability',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    accountNumber: '5000',
    accountName: 'Revenue',
    accountType: 'Income',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    accountNumber: '6000',
    accountName: 'Cost of Goods Sold',
    accountType: 'Expense',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const GLAccounts: React.FC = () => {
  const [accounts] = useState<GLAccount[]>(mockAccounts);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        GL Accounts
      </Typography>
      <Paper 
        sx={{ 
          overflow: 'hidden',
          boxShadow: 'none',
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.1),
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Number</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: account.isActive 
                          ? (theme) => alpha(theme.palette.success.main, 0.1)
                          : (theme) => alpha(theme.palette.error.main, 0.1),
                        color: account.isActive 
                          ? (theme) => theme.palette.success.main
                          : (theme) => theme.palette.error.main,
                        fontWeight: 500,
                      }}
                    >
                      {account.isActive ? 'Active' : 'Inactive'}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={accounts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
}; 