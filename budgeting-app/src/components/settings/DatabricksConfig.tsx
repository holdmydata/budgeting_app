import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  alpha,
  useTheme
} from '@mui/material';
import { useData } from '../../context/DataContext';

export const DatabricksConfig: React.FC = () => {
  const theme = useTheme();
  const { databricksConfig, setDatabricksConfig, connectToDatabricks } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    workspaceUrl: databricksConfig?.workspaceUrl || '',
    catalogName: databricksConfig?.catalogName || '',
    schema: databricksConfig?.schema || 'default'
  });

  useEffect(() => {
    if (databricksConfig) {
      setFormData({
        workspaceUrl: databricksConfig.workspaceUrl,
        catalogName: databricksConfig.catalogName,
        schema: databricksConfig.schema || 'default'
      });
    }
  }, [databricksConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update the configuration
      setDatabricksConfig(formData);

      // Test the connection
      const connected = await connectToDatabricks();
      if (!connected) {
        throw new Error('Failed to connect to Databricks');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
        Databricks Configuration
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Workspace URL"
            name="workspaceUrl"
            value={formData.workspaceUrl}
            onChange={handleChange}
            fullWidth
            required
            placeholder="https://your-workspace.cloud.databricks.com"
            helperText="Enter your Databricks workspace URL"
          />
          
          <TextField
            label="Catalog Name"
            name="catalogName"
            value={formData.catalogName}
            onChange={handleChange}
            fullWidth
            required
            placeholder="main"
            helperText="Enter your Databricks catalog name"
          />
          
          <TextField
            label="Schema"
            name="schema"
            value={formData.schema}
            onChange={handleChange}
            fullWidth
            placeholder="default"
            helperText="Enter your schema name (optional)"
          />
          
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 2,
              bgcolor: theme.palette.primary.main,
              color: '#ffffff',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.9),
              },
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Testing Connection...
              </>
            ) : (
              'Save & Test Connection'
            )}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Successfully connected to Databricks!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
}; 