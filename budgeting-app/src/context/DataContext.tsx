import React, { createContext, useContext, ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { FinancialTransaction, BudgetEntry, Project, GLAccount, KPI } from '../types/data';
import { 
  mockKPIs, 
  mockGLAccounts, 
  mockProjects, 
  mockTransactions, 
  mockBudgetEntries 
} from '../services/mockData';
import { DatabricksConnector } from '../api/databricksConnector';

// Databricks configuration interface
interface DatabricksConfig {
  workspaceUrl: string;  // e.g., https://adb-xxx.azuredatabricks.net
  catalogName: string;   // e.g., main, hive_metastore
  schema?: string;       // e.g., default, your_schema_name
  warehouseId?: string; // SQL warehouse ID
  apiKey?: string;     // Databricks API key for direct authentication
  httpPath?: string;    // e.g., /sql/1.0/warehouses/xxx
  computeHost?: string; // e.g., adb-xxx.azuredatabricks.net
  port?: number;        // default is 443
  useSSL?: boolean;     // default is true
}

// SQL Server configuration interface
interface SqlServerConfig {
  serverUrl: string;
  database: string;
  useWindowsAuth?: boolean;
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Always use mock data for demo/development
const useMockData = true;

// Define the connection type enum
enum ConnectionType {
  MOCK = 'mock',
  DATABRICKS = 'databricks',
  SQL_SERVER = 'sqlServer'
}

// Define the shape of our data context
interface DataContextType {
  isLoading: boolean;
  connectionType: ConnectionType;
  setConnectionType: (type: ConnectionType) => void;
  databricksConfig: DatabricksConfig | null;
  setDatabricksConfig: (config: DatabricksConfig) => void;
  sqlServerConfig: SqlServerConfig | null;
  setSqlServerConfig: (config: SqlServerConfig) => void;
  connectToDatabricks: () => Promise<boolean>;
  connectToSqlServer: () => Promise<boolean>;
  invalidateQueries: (queryKey: string) => Promise<void>;
  fetchDashboardKPIs: () => Promise<KPI[]>;
  fetchProjects: () => Promise<Project[]>;
  fetchProjectDetails: (projectId: string) => Promise<Project>;
  fetchGLAccounts: (filters?: object) => Promise<GLAccount[]>;
  fetchTransactions: (filters?: object) => Promise<FinancialTransaction[]>;
  fetchBudgetEntries: (filters?: object) => Promise<BudgetEntry[]>;
  executeSqlQuery: (query: string) => Promise<any>;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component that wraps your app and provides the data context
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { acquireToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.MOCK);
  const [databricksConfig, setDatabricksConfig] = useState<DatabricksConfig | null>(null);
  const [sqlServerConfig, setSqlServerConfig] = useState<SqlServerConfig | null>(null);
  const [databricksConnector, setDatabricksConnector] = useState<DatabricksConnector | null>(null);

  // Clean up connections when unmounting or when connection type changes
  React.useEffect(() => {
    return () => {
      // Close Databricks connection when unmounting
      if (databricksConnector) {
        console.log('Closing Databricks connection');
        databricksConnector.close().catch(err => {
          console.error('Error closing Databricks connection:', err);
        });
      }
    };
  }, [databricksConnector]);

  // Clean up connections when connection type changes
  React.useEffect(() => {
    const cleanupPreviousConnections = async () => {
      if (databricksConnector && connectionType !== ConnectionType.DATABRICKS) {
        console.log('Closing Databricks connection due to connection type change');
        await databricksConnector.close().catch(err => {
          console.error('Error closing Databricks connection:', err);
        });
        setDatabricksConnector(null);
      }
    };
    
    cleanupPreviousConnections();
  }, [connectionType]);

  // Helper function to make authenticated API calls
  const fetchWithAuth = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
    if (useMockData || connectionType === ConnectionType.MOCK) {
      // Return mock data based on the URL pattern
      console.log('Using mock data instead of API call to:', url);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      if (url.includes('/api/kpis')) return mockKPIs as unknown as T;
      if (url.includes('/api/projects')) {
        if (url.includes('/api/projects/')) {
          const id = url.split('/').pop();
          return mockProjects.find(p => p.id === id) as unknown as T;
        }
        return mockProjects as unknown as T;
      }
      if (url.includes('/api/gl-accounts')) return mockGLAccounts as unknown as T;
      if (url.includes('/api/transactions')) return mockTransactions as unknown as T;
      if (url.includes('/api/budget-entries')) return mockBudgetEntries as unknown as T;
      
      throw new Error('No mock data available for this endpoint');
    }

    setIsLoading(true);
    try {
      const token = await acquireToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API call failed:', error);
      
      // Fallback to mock data on API failure
      console.log('Falling back to mock data');
      if (url.includes('/api/kpis')) return mockKPIs as unknown as T;
      if (url.includes('/api/projects')) {
        if (url.includes('/api/projects/')) {
          const id = url.split('/').pop();
          return mockProjects.find(p => p.id === id) as unknown as T;
        }
        return mockProjects as unknown as T;
      }
      if (url.includes('/api/gl-accounts')) return mockGLAccounts as unknown as T;
      if (url.includes('/api/transactions')) return mockTransactions as unknown as T;
      if (url.includes('/api/budget-entries')) return mockBudgetEntries as unknown as T;
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to make authenticated Databricks API calls
  const fetchFromDatabricks = async <T,>(query: string): Promise<T> => {
    if (!databricksConfig) {
      throw new Error('Databricks configuration not set');
    }

    setIsLoading(true);
    try {
      if (databricksConnector) {
        // Use the DatabricksConnector if it's initialized
        const results = await databricksConnector.executeQuery<T extends any[] ? T[number] : T>(query);
        return Array.isArray(results) ? results as unknown as T : results as T;
      } else {
        throw new Error('Databricks connector not initialized');
      }
    } catch (error) {
      console.error('Databricks query failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a helper for building Databricks SQL queries with safety
  const buildDatabricksQuery = (baseQuery: string, filters?: Record<string, any>) => {
    if (!filters || Object.keys(filters).length === 0) {
      return { query: baseQuery, parameters: {} };
    }

    const conditions: string[] = [];
    const parameters: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value], index) => {
      const paramName = `param_${index}`;
      conditions.push(`${key} = :${paramName}`);
      parameters[paramName] = value;
    });

    const query = `${baseQuery}${conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''}`;
    return { query, parameters };
  };

  // Function to execute direct SQL Server query
  const executeSqlQuery = async (query: string): Promise<any> => {
    if (connectionType === ConnectionType.MOCK) {
      console.log('Mock SQL query execution:', query);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Return mock data based on query content
      // This is simplistic - you'd want to make this smarter in a real implementation
      if (query.toLowerCase().includes('kpi')) return mockKPIs;
      if (query.toLowerCase().includes('project')) return mockProjects;
      if (query.toLowerCase().includes('account')) return mockGLAccounts;
      if (query.toLowerCase().includes('transaction')) return mockTransactions;
      if (query.toLowerCase().includes('budget')) return mockBudgetEntries;
      
      return []; // Default empty response
    }

    if (connectionType !== ConnectionType.SQL_SERVER || !sqlServerConfig) {
      throw new Error('SQL Server configuration not set or connection type is not SQL Server');
    }

    setIsLoading(true);
    try {
      // In a real app, you'd likely have a backend API endpoint that handles the SQL connection
      const token = await acquireToken();
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/sql-query`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: sqlServerConfig.serverUrl,
          database: sqlServerConfig.database,
          useWindowsAuth: sqlServerConfig.useWindowsAuth || false,
          query: query
        }),
      });

      if (!response.ok) {
        throw new Error(`SQL Server API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('SQL query failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Test Databricks connection
  const connectToDatabricks = async (): Promise<boolean> => {
    try {
      if (!databricksConfig) {
        throw new Error('Databricks configuration not set');
      }

      if (!databricksConfig.httpPath) {
        throw new Error('HTTP Path is required for Databricks connection');
      }

      // Create a new DatabricksConnector instance
      const connector = new DatabricksConnector(databricksConfig);
      
      // Test the connection
      const isConnected = await connector.connect();
      
      if (!isConnected) {
        throw new Error('Failed to connect to Databricks');
      }
      
      // Update state
      setDatabricksConnector(connector);
      setConnectionType(ConnectionType.DATABRICKS);
      console.log('Successfully connected to Databricks');
      return true;
    } catch (error) {
      console.error('Databricks connection test failed:', error);
      return false;
    }
  };

  // Test SQL Server connection
  const connectToSqlServer = async (): Promise<boolean> => {
    try {
      if (!sqlServerConfig) {
        throw new Error('SQL Server configuration not set');
      }

      const testQuery = 'SELECT 1';
      await executeSqlQuery(testQuery);
      setConnectionType(ConnectionType.SQL_SERVER);
      return true;
    } catch (error) {
      console.error('SQL Server connection test failed:', error);
      return false;
    }
  };

  // Function to invalidate and refetch queries
  const invalidateQueries = async (queryKey: string) => {
    await queryClient.invalidateQueries([queryKey]);
  };

  // Data fetching functions - these can now use either connection type
  const fetchDashboardKPIs = async (): Promise<KPI[]> => {
    if (connectionType === ConnectionType.DATABRICKS) {
      if (databricksConnector) {
        return await databricksConnector.fetchDashboardKPIs();
      }
      
      // Fall back to executing a query directly
      const query = `
        SELECT 
          id,
          title,
          value,
          formattedValue,
          change,
          secondaryValue
        FROM kpi_view
      `;
      return await fetchFromDatabricks<KPI[]>(query);
    }

    if (connectionType === ConnectionType.SQL_SERVER) {
      // Example SQL query for KPIs - adjust to match your schema
      const query = `SELECT * FROM KPIs`;
      return await executeSqlQuery(query);
    }
    
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/kpis`;
    return fetchWithAuth<KPI[]>(apiUrl);
  };

  const fetchProjects = async (): Promise<Project[]> => {
    if (connectionType === ConnectionType.DATABRICKS) {
      if (databricksConnector) {
        return await databricksConnector.fetchProjects();
      }
      
      // Fall back to executing a query directly
      const query = 'SELECT * FROM projects';
      return await fetchFromDatabricks<Project[]>(query);
    }
    
    if (connectionType === ConnectionType.SQL_SERVER) {
      // Example SQL query for projects - adjust to match your schema
      const query = `SELECT * FROM Projects`;
      return await executeSqlQuery(query);
    }
    
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/projects`;
    return fetchWithAuth<Project[]>(apiUrl);
  };

  const fetchProjectDetails = async (projectId: string): Promise<Project> => {
    if (connectionType === ConnectionType.SQL_SERVER) {
      // Example SQL query for project details - adjust to match your schema
      const query = `SELECT * FROM Projects WHERE id = '${projectId}'`;
      const results = await executeSqlQuery(query);
      return results[0];
    }
    
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/projects/${projectId}`;
    return fetchWithAuth<Project>(apiUrl);
  };

  const fetchGLAccounts = async (filters?: object): Promise<GLAccount[]> => {
    if (connectionType === ConnectionType.DATABRICKS) {
      if (databricksConnector) {
        return await databricksConnector.fetchGLAccounts();
      }
      
      // Fall back to executing a query directly
      const { query, parameters } = buildDatabricksQuery(
        'SELECT * FROM gl_accounts',
        filters
      );
      return await fetchFromDatabricks<GLAccount[]>(query);
    }
    
    if (connectionType === ConnectionType.SQL_SERVER) {
      const query = `SELECT * FROM GLAccounts`;
      return await executeSqlQuery(query);
    }
    
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/gl-accounts`;
    return fetchWithAuth<GLAccount[]>(apiUrl);
  };

  const fetchTransactions = async (filters: object = {}): Promise<FinancialTransaction[]> => {
    if (connectionType === ConnectionType.DATABRICKS) {
      if (databricksConnector) {
        return await databricksConnector.fetchTransactions(filters);
      }
      
      // Fall back to executing a query directly
      const { query, parameters } = buildDatabricksQuery(
        'SELECT * FROM financial_transactions',
        filters
      );
      return await fetchFromDatabricks<FinancialTransaction[]>(query);
    }
    
    if (connectionType === ConnectionType.SQL_SERVER) {
      let query = `SELECT * FROM Transactions WHERE 1=1`;
      Object.entries(filters).forEach(([key, value]) => {
        query += ` AND ${key} = '${value}'`;
      });
      return await executeSqlQuery(query);
    }
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/transactions?${queryParams.toString()}`;
    return fetchWithAuth<FinancialTransaction[]>(apiUrl);
  };

  const fetchBudgetEntries = async (filters: object = {}): Promise<BudgetEntry[]> => {
    if (connectionType === ConnectionType.DATABRICKS) {
      if (databricksConnector) {
        return await databricksConnector.fetchBudgetEntries(filters);
      }
      
      // Fall back to executing a query directly
      const { query, parameters } = buildDatabricksQuery(
        'SELECT * FROM budget_entries',
        filters
      );
      return await fetchFromDatabricks<BudgetEntry[]>(query);
    }
    
    if (connectionType === ConnectionType.SQL_SERVER) {
      let query = `SELECT * FROM BudgetEntries WHERE 1=1`;
      Object.entries(filters).forEach(([key, value]) => {
        query += ` AND ${key} = '${value}'`;
      });
      return await executeSqlQuery(query);
    }
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/budget-entries?${queryParams.toString()}`;
    return fetchWithAuth<BudgetEntry[]>(apiUrl);
  };

  // Value object to provide through the context
  const value = {
    isLoading,
    connectionType,
    setConnectionType,
    databricksConfig,
    setDatabricksConfig,
    sqlServerConfig, 
    setSqlServerConfig,
    connectToDatabricks,
    connectToSqlServer,
    invalidateQueries,
    fetchDashboardKPIs,
    fetchProjects,
    fetchProjectDetails,
    fetchGLAccounts,
    fetchTransactions,
    fetchBudgetEntries,
    executeSqlQuery
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DataContext.Provider value={value}>{children}</DataContext.Provider>
    </QueryClientProvider>
  );
};

// Custom hook to use the data context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 