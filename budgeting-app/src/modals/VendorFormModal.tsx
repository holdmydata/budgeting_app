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
  Switch,
  FormControlLabel,
  Rating,
  Grid
} from '@mui/material';
import { Vendor } from '../types/data';
import { SelectChangeEvent } from '@mui/material/Select';

/**
 * Props for VendorFormModal
 * @param open - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param onSubmit - Function called with form data on submit
 * @param initialData - Vendor data for edit mode (optional)
 * @param mode - 'add' or 'edit' (optional, for clarity)
 */
interface VendorFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Vendor, 'id'> & { id?: string }) => void;
  initialData?: Vendor | null;
  mode?: 'add' | 'edit';
}

const categoryOptions = [
  'Software',
  'Cloud Services',
  'Hardware',
  'Consulting',
  'Network',
  'Security',
  'Other'
];

const VendorFormModal: React.FC<VendorFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'add',
}) => {
  // Form state
  const [form, setForm] = useState<Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>>({
    vendorName: '',
    vendorCode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    category: '',
    performanceScore: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form for edit mode
  useEffect(() => {
    if (initialData) {
      const { id, createdAt, updatedAt, ...rest } = initialData;
      setForm({ ...rest });
    } else {
      setForm({
        vendorName: '',
        vendorCode: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        category: '',
        performanceScore: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [initialData, open]);

  // Handle input changes for text fields
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name!]: value }));
  };

  // Handle select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name!]: value }));
  };

  // Handle switch (isActive)
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  // Handle rating change
  const handleRatingChange = (_: any, value: number | null) => {
    setForm((prev) => ({ ...prev, performanceScore: value || 0 }));
  };

  // Basic validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.vendorName) newErrors.vendorName = 'Vendor name is required';
    if (!form.vendorCode) newErrors.vendorCode = 'Vendor code is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.contactEmail) newErrors.contactEmail = 'Email is required';
    if (!form.contactName) newErrors.contactName = 'Contact name is required';
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
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', pb: 0 }}>{mode === 'edit' ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
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
                label="Vendor Name"
                name="vendorName"
                value={form.vendorName}
                onChange={handleTextFieldChange}
                error={!!errors.vendorName}
                helperText={errors.vendorName}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor Code"
                name="vendorCode"
                value={form.vendorCode}
                onChange={handleTextFieldChange}
                error={!!errors.vendorCode}
                helperText={errors.vendorCode}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel shrink>Category</InputLabel>
                <Select
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleSelectChange}
                  required
                >
                  {categoryOptions.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Name"
                name="contactName"
                value={form.contactName}
                onChange={handleTextFieldChange}
                error={!!errors.contactName}
                helperText={errors.contactName}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleTextFieldChange}
                error={!!errors.contactEmail}
                helperText={errors.contactEmail}
                fullWidth
                required
                type="email"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Phone"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleTextFieldChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} sm={6} display="flex" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <span>Rating:</span>
                <Rating
                  value={form.performanceScore}
                  precision={0.5}
                  onChange={handleRatingChange}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
          <Button onClick={onClose} color="secondary" variant="outlined" sx={{ borderRadius: 2, minWidth: 100, mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, minWidth: 120, fontWeight: 600 }}>
            {mode === 'edit' ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VendorFormModal; 