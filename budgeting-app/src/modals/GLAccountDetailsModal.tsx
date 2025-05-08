import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { GLAccount } from '../types/data';

/**
 * Props for GLAccountDetailsModal
 * @param open - Whether the modal is open
 * @param onClose - Function to close the modal
 * @param glAccount - The GL Account object to display (or null)
 */
interface GLAccountDetailsModalProps {
  open: boolean;
  onClose: () => void;
  glAccount: GLAccount | null;
}

const GLAccountDetailsModal: React.FC<GLAccountDetailsModalProps> = ({
  open,
  onClose,
  glAccount,
}) => {
  if (!glAccount) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>GL Account Details</DialogTitle>
      <DialogContent>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
              <Typography variant="body1">{glAccount.accountNumber}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Account Name</Typography>
              <Typography variant="body1">{glAccount.accountName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Account Type</Typography>
              <Typography variant="body1">{glAccount.accountType}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip label={glAccount.isActive ? 'Active' : 'Inactive'} color={glAccount.isActive ? 'success' : 'error'} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Valid From</Typography>
              <Typography variant="body2">{glAccount.validFrom ? new Date(glAccount.validFrom).toLocaleDateString() : '-'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Valid To</Typography>
              <Typography variant="body2">{glAccount.validTo ? new Date(glAccount.validTo).toLocaleDateString() : 'Current'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Current Version</Typography>
              <Typography variant="body2">{glAccount.isCurrent ? 'Yes' : 'No'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography variant="body2">{glAccount.createdAt ? new Date(glAccount.createdAt).toLocaleString() : '-'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
              <Typography variant="body2">{glAccount.updatedAt ? new Date(glAccount.updatedAt).toLocaleString() : '-'}</Typography>
            </Grid>
            {glAccount.modifiedBy && (
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Modified By</Typography>
                <Typography variant="body2">{glAccount.modifiedBy}</Typography>
              </Grid>
            )}
            {glAccount.changeReason && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Change Reason</Typography>
                <Typography variant="body2">{glAccount.changeReason}</Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GLAccountDetailsModal; 