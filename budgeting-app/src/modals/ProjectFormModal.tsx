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
import { Project } from '../types/data';
import { SelectChangeEvent } from '@mui/material/Select';

/**
 * Props for ProjectFormModal
 * @param open - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param onSubmit - Function called with form data on submit
 * @param initialData - Project data for edit mode (optional)
 * @param mode - 'add' or 'edit' (optional, for clarity)
 */
interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Project, 'id'> & { id?: string }) => void;
  initialData?: Project | null;
  mode?: 'add' | 'edit';
}

const statusOptions = [
  'Planned',
  'In Progress',
  'Completed',
  'On Hold',
  'Cancelled'
];

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'add',
}) => {
  // Form state
  const [form, setForm] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>({
    projectCode: '',
    projectName: '',
    description: '',
    status: 'Planned',
    startDate: '',
    endDate: '',
    budget: 0,
    spent: 0,
    owner: '',
    priority: 'Medium',
    glAccount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form for edit mode
  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setForm({ ...rest });
    } else {
      setForm({
        projectCode: '',
        projectName: '',
        description: '',
        status: 'Planned',
        startDate: '',
        endDate: '',
        budget: 0,
        spent: 0,
        owner: '',
        priority: 'Medium',
        glAccount: '',
      });
    }
    setErrors({});
  }, [initialData, open]);

  // Handle input changes
  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name!]: name === 'budget' || name === 'spent' ? Number(value) : value,
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
    if (!form.projectCode) newErrors.projectCode = 'Project code is required';
    if (!form.projectName) newErrors.projectName = 'Project name is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (!form.status) newErrors.status = 'Status is required';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (!form.owner) newErrors.owner = 'Manager is required';
    if (!form.priority) newErrors.priority = 'Priority is required';
    if (!form.glAccount) newErrors.glAccount = 'GL Account is required';
    if (form.budget < 0) newErrors.budget = 'Budget cannot be negative';
    if (form.spent < 0) newErrors.spent = 'Spent cannot be negative';
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
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', pb: 0 }}>{mode === 'edit' ? 'Edit Project' : 'New Project'}</DialogTitle>
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
                label="Project Code"
                name="projectCode"
                value={form.projectCode}
                onChange={handleTextFieldChange}
                error={!!errors.projectCode}
                helperText={errors.projectCode}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Project Name"
                name="projectName"
                value={form.projectName}
                onChange={handleTextFieldChange}
                error={!!errors.projectName}
                helperText={errors.projectName}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel shrink>Priority</InputLabel>
                <Select
                  label="Priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
                {errors.priority && <FormHelperText>{errors.priority}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleTextFieldChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleTextFieldChange}
                error={!!errors.endDate}
                helperText={errors.endDate}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Budget"
                name="budget"
                type="number"
                value={form.budget}
                onChange={handleTextFieldChange}
                error={!!errors.budget}
                helperText={errors.budget}
                fullWidth
                required
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Spent"
                name="spent"
                type="number"
                value={form.spent}
                onChange={handleTextFieldChange}
                error={!!errors.spent}
                helperText={errors.spent}
                fullWidth
                required
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Manager"
                name="owner"
                value={form.owner}
                onChange={handleTextFieldChange}
                error={!!errors.owner}
                helperText={errors.owner}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
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
                  {/* TODO: Replace with real GL Account options from context/props */}
                  <MenuItem value="1000">1000 - IT Operations</MenuItem>
                  <MenuItem value="2000">2000 - Software Licenses</MenuItem>
                  <MenuItem value="3000">3000 - Hardware</MenuItem>
                </Select>
                {errors.glAccount && <FormHelperText>{errors.glAccount}</FormHelperText>}
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

export default ProjectFormModal; 