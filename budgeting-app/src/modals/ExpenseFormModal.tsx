import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  FormHelperText,
  Grid
} from '@mui/material';
import { FinancialTransaction } from '../types/data';
import { SelectChangeEvent } from '@mui/material/Select';
import { mockGLAccounts, mockProjects, mockVendorLookup } from '../services/mockData';

/**
 * Props for ExpenseFormModal
 * @param open - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param onSubmit - Function called with form data on submit
 * @param initialData - Transaction data for edit mode (optional)
 * @param mode - 'add' or 'edit' (optional, for clarity)
 */
interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FinancialTransaction, 'id'> & { id?: string }) => void;
  initialData?: FinancialTransaction | null;
  mode?: 'add' | 'edit';
}

const statusOptions = [
  'Pending',
  'Approved',
  'Processed',
  'Rejected'
];

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'add',
}) => {
  // Form state
  const [form, setForm] = useState<Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>>({
    date: '',
    glAccount: '',
    project: '',
    description: '',
    amount: 0,
    voucherNumber: '',
    vendor: '',
    status: 'Pending',
    userId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form for edit mode
  useEffect(() => {
    if (initialData) {
      const { id, createdAt, updatedAt, ...rest } = initialData;
      setForm({ ...rest });
    } else {
      setForm({
        date: '',
        glAccount: '',
        project: '',
        description: '',
        amount: 0,
        voucherNumber: '',
        vendor: '',
        status: 'Pending',
        userId: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  // Handle input changes
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name!]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name!]: value,
    }));
  };

  // Basic validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.glAccount) newErrors.glAccount = 'GL Account is required';
    if (!form.project) newErrors.project = 'Project is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (form.amount === undefined || isNaN(form.amount)) newErrors.amount = 'Amount is required';
    if (!form.voucherNumber) newErrors.voucherNumber = 'Reference is required';
    if (!form.vendor) newErrors.vendor = 'Vendor is required';
    if (!form.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (mode === 'edit' && initialData?.id) {
      onSubmit({
        ...form,
        id: initialData.id,
        createdAt: initialData.createdAt,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const now = new Date().toISOString();
      onSubmit({
        ...form,
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
      sx: {
        borderRadius: 3,
        boxShadow: 6,
      }
    }}>
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', pb: 0 }}>{mode === 'edit' ? 'Edit Expense' : 'New Expense'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(46, 125, 50, 0.04)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 1,
            mb: 1,
            px: { xs: 1, sm: 3 },
            py: { xs: 2, sm: 3 },
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleTextFieldChange}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.glAccount}>
                <InputLabel shrink>GL Account</InputLabel>
                <Select
                  label="GL Account"
                  name="glAccount"
                  value={form.glAccount}
                  onChange={handleSelectChange}
                  required
                >
                  {mockGLAccounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id}>{acc.accountNumber} - {acc.accountName}</MenuItem>
                  ))}
                </Select>
                {errors.glAccount && <FormHelperText>{errors.glAccount}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.project}>
                <InputLabel shrink>Project</InputLabel>
                <Select
                  label="Project"
                  name="project"
                  value={form.project}
                  onChange={handleSelectChange}
                  required
                >
                  {mockProjects.map(proj => (
                    <MenuItem key={proj.id} value={proj.id}>{proj.projectCode} - {proj.projectName}</MenuItem>
                  ))}
                </Select>
                {errors.project && <FormHelperText>{errors.project}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleTextFieldChange}
                error={!!errors.description}
                helperText={errors.description}
                fullWidth
                required
                multiline
                minRows={2}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleTextFieldChange}
                error={!!errors.amount}
                helperText={errors.amount}
                fullWidth
                required
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Reference"
                name="voucherNumber"
                value={form.voucherNumber}
                onChange={handleTextFieldChange}
                error={!!errors.voucherNumber}
                helperText={errors.voucherNumber}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.vendor}>
                <InputLabel shrink>Vendor</InputLabel>
                <Select
                  label="Vendor"
                  name="vendor"
                  value={form.vendor}
                  onChange={handleSelectChange}
                  required
                >
                  {Object.entries(mockVendorLookup).map(([id, name]) => (
                    <MenuItem key={id} value={id}>{name}</MenuItem>
                  ))}
                </Select>
                {errors.vendor && <FormHelperText>{errors.vendor}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel shrink>Status</InputLabel>
                <Select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleSelectChange}
                  required
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
          <Button onClick={onClose} color="secondary" variant="outlined" sx={{ borderRadius: 2, minWidth: 100, mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, minWidth: 120, fontWeight: 600 }}>
            {mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseFormModal; 