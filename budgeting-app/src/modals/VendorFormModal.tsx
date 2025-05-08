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
  Rating
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'edit' ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Vendor Name"
              name="vendorName"
              value={form.vendorName}
              onChange={handleTextFieldChange}
              error={!!errors.vendorName}
              helperText={errors.vendorName}
              fullWidth
              required
            />
            <TextField
              label="Vendor Code"
              name="vendorCode"
              value={form.vendorCode}
              onChange={handleTextFieldChange}
              error={!!errors.vendorCode}
              helperText={errors.vendorCode}
              fullWidth
              required
            />
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
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
            <TextField
              label="Contact Name"
              name="contactName"
              value={form.contactName}
              onChange={handleTextFieldChange}
              error={!!errors.contactName}
              helperText={errors.contactName}
              fullWidth
              required
            />
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
            />
            <TextField
              label="Contact Phone"
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleTextFieldChange}
              fullWidth
            />
            <Box display="flex" alignItems="center" gap={2}>
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
              <Box display="flex" alignItems="center" gap={1}>
                <span>Rating:</span>
                <Rating
                  value={form.performanceScore}
                  precision={0.5}
                  onChange={handleRatingChange}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'edit' ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VendorFormModal; 