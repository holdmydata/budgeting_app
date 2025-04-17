import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  FormHelperText,
  Grid
} from '@mui/material';
import { dataService, DataSourceType, DataConfig, DatabricksConfig } from '../services/dataService';

const DataSourceConfig: React.FC = () => {
  // Current config state
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>(DataSourceType.MOCK);
  
  // Databricks config
  const [workspaceUrl, setWorkspaceUrl] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [httpPath, setHttpPath] = useState('');
  const [catalog, setCatalog] = useState('');
  const [schema, setSchema] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // API config
  const [baseUrl, setBaseUrl] = useState('');
  const [apiHeaders, setApiHeaders] = useState('');
  
  // Mock config
  const [mockDelay, setMockDelay] = useState(500);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  // Load current configuration
  useEffect(() => {
    // In a real app, you might load the config from localStorage or a backend service
    try {
      const savedConfig = localStorage.getItem('dataSourceConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig) as DataConfig;
        
        // Update state based on the config type
        setDataSourceType(config.type);
        
        switch (config.type) {
          case DataSourceType.DATABRICKS:
            setWorkspaceUrl(config.workspaceUrl || '');
            setWarehouseId(config.warehouseId || '');
            setHttpPath(config.httpPath || '');
            setCatalog(config.catalog || '');
            setSchema(config.schema || '');
            setApiKey(config.apiKey || '');
            break;
            
          case DataSourceType.API:
            setBaseUrl(config.baseUrl || '');
            setApiHeaders(JSON.stringify(config.headers || {}, null, 2));
            if (config.apiKey) setApiKey(config.apiKey);
            break;
            
          case DataSourceType.MOCK:
            if ('delayMs' in config) {
              setMockDelay(config.delayMs || 500);
            }
            break;
        }
      }
    } catch (error) {
      console.error('Error loading saved configuration:', error);
    }
  }, []);
  
  // Create configuration object based on the selected data source type
  const buildConfig = (): DataConfig => {
    switch (dataSourceType) {
      case DataSourceType.DATABRICKS:
        return {
          type: DataSourceType.DATABRICKS,
          workspaceUrl,
          warehouseId,
          httpPath,
          catalog,
          schema,
          apiKey: apiKey || undefined
        };
        
      case DataSourceType.API:
        let headers: Record<string, string> = {};
        try {
          if (apiHeaders) {
            headers = JSON.parse(apiHeaders);
          }
        } catch (error) {
          console.error('Invalid API headers JSON:', error);
        }
        
        return {
          type: DataSourceType.API,
          baseUrl,
          apiKey: apiKey || undefined,
          headers
        };
        
      case DataSourceType.MOCK:
      default:
        return {
          type: DataSourceType.MOCK,
          delayMs: mockDelay
        };
    }
  };
  
  // Save configuration
  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const config = buildConfig();
      
      // Save the config to the data service - now async
      await dataService.setConfig(config);
      
      // Also save to localStorage for persistence across refreshes
      localStorage.setItem('dataSourceConfig', JSON.stringify(config));
      
      // Show success message
      setTestResult({ success: true, message: 'Configuration saved successfully' });
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setTestResult({ 
        success: false, 
        message: `Error saving configuration: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test connection
  const handleTest = async () => {
    setIsLoading(true);
    
    try {
      const config = buildConfig();
      
      if (config.type === DataSourceType.DATABRICKS) {
        // Test the Databricks connection using the server API
        const success = await dataService.testDatabricksConnection(config as DatabricksConfig);
        
        if (success) {
          setTestResult({ success: true, message: 'Connection test successful!' });
        } else {
          setTestResult({ success: false, message: 'Connection test failed. Check your configuration and try again.' });
        }
      } else if (config.type === DataSourceType.API) {
        // For API connections, try to fetch KPIs
        // Apply the config temporarily for testing
        await dataService.setConfig(config);
        
        // Test the connection by fetching KPIs
        await dataService.fetchKPIs();
        
        // If we get here, it worked
        setTestResult({ success: true, message: 'API Connection test successful!' });
      } else {
        // Mock data is always available
        setTestResult({ success: true, message: 'Mock data is ready to use!' });
      }
      
      setShowSnackbar(true);
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({ 
        success: false, 
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardHeader 
          title="Data Source Configuration" 
          subheader="Configure how the application connects to your data"
        />
        
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="data-source-select-label">Data Source Type</InputLabel>
                <Select
                  labelId="data-source-select-label"
                  id="data-source-select"
                  value={dataSourceType}
                  label="Data Source Type"
                  onChange={(e) => setDataSourceType(e.target.value as DataSourceType)}
                >
                  <MenuItem value={DataSourceType.MOCK}>Mock Data (Development/Demo)</MenuItem>
                  <MenuItem value={DataSourceType.DATABRICKS}>Databricks SQL</MenuItem>
                  <MenuItem value={DataSourceType.API}>REST API</MenuItem>
                </Select>
                <FormHelperText>
                  {dataSourceType === DataSourceType.MOCK && 'Uses built-in mock data for demonstration purposes'}
                  {dataSourceType === DataSourceType.DATABRICKS && 'Connects to Databricks SQL through secure server middleware'}
                  {dataSourceType === DataSourceType.API && 'Connects to a REST API backend service'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Databricks Configuration */}
            {dataSourceType === DataSourceType.DATABRICKS && (
              <>
                <Grid item xs={12}>
                  <Divider>Databricks Configuration</Divider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="workspace-url"
                    label="Workspace URL"
                    variant="outlined"
                    placeholder="https://adb-xxx.azuredatabricks.net"
                    value={workspaceUrl}
                    onChange={(e) => setWorkspaceUrl(e.target.value)}
                    helperText="The URL of your Databricks workspace"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="warehouse-id"
                    label="SQL Warehouse ID"
                    variant="outlined"
                    placeholder="12345-abcde"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    helperText="The ID of your SQL warehouse"
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="http-path"
                    label="HTTP Path"
                    variant="outlined"
                    placeholder="/sql/1.0/warehouses/xxx"
                    value={httpPath}
                    onChange={(e) => setHttpPath(e.target.value)}
                    helperText="The HTTP path for SQL warehouse"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="catalog"
                    label="Catalog Name"
                    variant="outlined"
                    placeholder="hive_metastore"
                    value={catalog}
                    onChange={(e) => setCatalog(e.target.value)}
                    helperText="The catalog to use (e.g., hive_metastore)"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="schema"
                    label="Schema Name"
                    variant="outlined"
                    placeholder="default"
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    helperText="The schema to use (e.g., default)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="api-key"
                    label="API Key"
                    variant="outlined"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    helperText="Your Databricks API Key for authentication"
                  />
                </Grid>
              </>
            )}
            
            {/* API Configuration */}
            {dataSourceType === DataSourceType.API && (
              <>
                <Grid item xs={12}>
                  <Divider>REST API Configuration</Divider>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="base-url"
                    label="Base URL"
                    variant="outlined"
                    placeholder="https://api.example.com"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    helperText="The base URL of the API"
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="api-key"
                    label="API Key"
                    variant="outlined"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    helperText="Your API Key for authentication (if required)"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="api-headers"
                    label="Additional Headers"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={apiHeaders}
                    onChange={(e) => setApiHeaders(e.target.value)}
                    helperText="Additional headers as JSON object (e.g., {'Content-Type': 'application/json'})"
                  />
                </Grid>
              </>
            )}
            
            {/* Mock Data Configuration */}
            {dataSourceType === DataSourceType.MOCK && (
              <>
                <Grid item xs={12}>
                  <Divider>Mock Data Configuration</Divider>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="mock-delay"
                    label="Simulated Delay (ms)"
                    variant="outlined"
                    type="number"
                    value={mockDelay}
                    onChange={(e) => setMockDelay(parseInt(e.target.value) || 0)}
                    helperText="Simulated network delay in milliseconds (for testing loading states)"
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Save Configuration'}
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleTest}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Test Connection'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={testResult?.success ? 'success' : 'error'}
          variant="filled"
        >
          {testResult?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataSourceConfig; 