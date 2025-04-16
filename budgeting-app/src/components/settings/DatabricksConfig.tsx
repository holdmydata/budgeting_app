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
  useTheme,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { useData } from '../../context/DataContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const DatabricksConfig: React.FC = () => {
  const theme = useTheme();
  const { databricksConfig, setDatabricksConfig, connectToDatabricks } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    workspaceUrl: databricksConfig?.workspaceUrl || '',
    catalogName: databricksConfig?.catalogName || '',
    schema: databricksConfig?.schema || 'default',
    warehouseId: databricksConfig?.warehouseId || '',
    apiKey: databricksConfig?.apiKey || '',
    computeHost: databricksConfig?.computeHost || '',
    httpPath: databricksConfig?.httpPath || '',
    port: databricksConfig?.port || 443,
    useSSL: databricksConfig?.useSSL ?? true
  });

  useEffect(() => {
    if (databricksConfig) {
      setFormData({
        workspaceUrl: databricksConfig.workspaceUrl,
        catalogName: databricksConfig.catalogName,
        schema: databricksConfig.schema || 'default',
        warehouseId: databricksConfig.warehouseId || '',
        apiKey: databricksConfig.apiKey || '',
        computeHost: databricksConfig.computeHost || '',
        httpPath: databricksConfig.httpPath || '',
        port: databricksConfig.port || 443,
        useSSL: databricksConfig.useSSL ?? true
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
          
          <TextField
            label="Warehouse ID"
            name="warehouseId"
            value={formData.warehouseId}
            onChange={handleChange}
            fullWidth
            placeholder="xxxxxxxxxxxxxxxx"
            helperText="Enter your SQL warehouse ID (optional)"
          />
          
          <TextField
            label="API Key"
            name="apiKey"
            type={showApiKey ? "text" : "password"}
            value={formData.apiKey}
            onChange={handleChange}
            fullWidth
            placeholder="dapi123456789abcdef"
            helperText="Enter your Databricks API key for direct authentication (recommended)"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showApiKey ? "Hide API Key" : "Show API Key"}>
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />

          <TextField
            label="Compute Host"
            name="computeHost"
            value={formData.computeHost}
            onChange={handleChange}
            fullWidth
            placeholder="adb-xxx.azuredatabricks.net"
            helperText="Enter your Databricks compute host (optional)"
          />

          <TextField
            label="HTTP Path"
            name="httpPath"
            value={formData.httpPath}
            onChange={handleChange}
            fullWidth
            placeholder="/sql/1.0/warehouses/xxx"
            helperText="Enter your SQL warehouse HTTP path (optional)"
          />

          <TextField
            label="Port"
            name="port"
            type="number"
            value={formData.port}
            onChange={handleChange}
            fullWidth
            placeholder="443"
            helperText="Enter the port number (default: 443)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.useSSL}
                onChange={(e) => setFormData(prev => ({ ...prev, useSSL: e.target.checked }))}
                name="useSSL"
              />
            }
            label="Use SSL"
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