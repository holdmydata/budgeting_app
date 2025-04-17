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
import axios from 'axios';

// Databricks configuration interface
interface DatabricksConfig {
  workspaceUrl: string;  // e.g., https://adb-xxx.azuredatabricks.net
  catalogName: string;   // e.g., main, hive_metastore
  schema?: string;       // e.g., default, your_schema_name
  warehouseId?: string; // SQL warehouse ID
  apiKey?: string;     // Databricks API key for direct authentication
  httpPath?: string;    // e.g., /sql/1.0/warehouses/xxx
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

// Server URL for Databricks middleware
const SERVER_URL = 'http://localhost:5000';

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
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Clean up connections when unmounting or when connection type changes
  React.useEffect(() => {
    return () => {
      // Close Databricks connection when unmounting
      if (sessionId) {
        console.log('Closing Databricks connection');
        disconnectFromDatabricks().catch(err => {
          console.error('Error closing Databricks connection:', err);
        });
      }
    };
  }, [sessionId]);

  // Clean up connections when connection type changes
  React.useEffect(() => {
    const cleanupPreviousConnections = async () => {
      if (sessionId && connectionType !== ConnectionType.DATABRICKS) {
        console.log('Closing Databricks connection due to connection type change');
        await disconnectFromDatabricks().catch(err => {
          console.error('Error closing Databricks connection:', err);
        });
      }
    };
    
    cleanupPreviousConnections();
  }, [connectionType]);

  // Helper function to disconnect from Databricks
  const disconnectFromDatabricks = async (): Promise<void> => {
    if (!sessionId) return;
    
    try {
      await axios.post(`${SERVER_URL}/api/databricks/disconnect`, {
        sessionId
      });
      setSessionId(null);
    } catch (error) {
      console.error('Failed to disconnect from Databricks:', error);
    }
  };

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

  // Helper function to make authenticated Databricks API calls through server
  const fetchFromDatabricks = async <T,>(query: string): Promise<T> => {
    if (connectionType === ConnectionType.MOCK) {
      // For mock data, simulate network delay and return mock data based on query
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data based on query content (simplified)
      if (query.toLowerCase().includes('kpi')) return mockKPIs as unknown as T;
      if (query.toLowerCase().includes('project')) return mockProjects as unknown as T;
      if (query.toLowerCase().includes('account')) return mockGLAccounts as unknown as T;
      if (query.toLowerCase().includes('transaction')) return mockTransactions as unknown as T;
      if (query.toLowerCase().includes('budget')) return mockBudgetEntries as unknown as T;
      
      return [] as unknown as T;
    }
    
    if (!sessionId) {
      throw new Error('Databricks session not established');
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${SERVER_URL}/api/databricks/query`, {
        sessionId,
        query
      });
      
      if (response.data.success) {
        return response.data.data as T;
      } else {
        throw new Error(response.data.message || 'Databricks query failed');
      }
    } catch (error) {
      console.error('Databricks query failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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

    if (connectionType === ConnectionType.DATABRICKS) {
      return fetchFromDatabricks(query);
    }

    if (connectionType !== ConnectionType.SQL_SERVER || !sqlServerConfig) {
      throw new Error('SQL Server configuration not set or connection type is not SQL Server');
    }

    // Implement SQL Server query logic here
    throw new Error('SQL Server queries not implemented');
  };

  // Function to connect to Databricks
  const connectToDatabricks = async (): Promise<boolean> => {
    if (!databricksConfig || !databricksConfig.workspaceUrl || !databricksConfig.httpPath) {
      console.error('Databricks configuration not properly set');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${SERVER_URL}/api/databricks/connect`, {
        workspaceUrl: databricksConfig.workspaceUrl,
        httpPath: databricksConfig.httpPath,
        warehouseId: databricksConfig.warehouseId,
        catalog: databricksConfig.catalogName,
        schema: databricksConfig.schema,
        apiKey: databricksConfig.apiKey
      });
      
      if (response.data.success) {
        setSessionId(response.data.sessionId);
        console.log('Connected to Databricks via server middleware, session ID:', response.data.sessionId);
        return true;
      } else {
        console.error('Failed to connect to Databricks:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Failed to connect to Databricks:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to connect to SQL Server
  const connectToSqlServer = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Implement SQL Server connection logic here
      // This is a placeholder - in a real app, you'd have actual connection logic
      console.log('Connecting to SQL Server with config:', sqlServerConfig);
      
      // Simulate connection success
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Connected to SQL Server (simulated)');
      
      return true;
    } catch (error) {
      console.error('Failed to connect to SQL Server:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to invalidate React Query cache
  const invalidateQueries = async (queryKey: string) => {
    await queryClient.invalidateQueries([queryKey]);
  };

  // Function to fetch dashboard KPIs
  const fetchDashboardKPIs = async (): Promise<KPI[]> => {
    if (useMockData || connectionType === ConnectionType.MOCK) {
      console.log('Using mock KPI data');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return [...mockKPIs];
    }

    if (connectionType === ConnectionType.DATABRICKS) {
      if (!sessionId) {
        await connectToDatabricks();
      }
      
      try {
        const response = await axios.get(`${SERVER_URL}/api/kpis`, {
          params: { sessionId }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch KPIs from Databricks:', error);
        // Fallback to mock data on error
        return [...mockKPIs];
      }
    }

    if (connectionType === ConnectionType.SQL_SERVER) {
      try {
        // For SQL Server, execute a query to get KPIs
        const query = `SELECT id, title, value, formattedValue, change, secondaryValue FROM kpi_view`;
        return await executeSqlQuery(query);
      } catch (error) {
        console.error('Failed to fetch KPIs from SQL Server:', error);
        // Fallback to mock data on error
        return [...mockKPIs];
      }
    }

    return [...mockKPIs]; // Default fallback
  };

  // Function to fetch projects
  const fetchProjects = async (): Promise<Project[]> => {
    if (useMockData || connectionType === ConnectionType.MOCK) {
      console.log('Using mock project data');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return [...mockProjects];
    }

    if (connectionType === ConnectionType.DATABRICKS) {
      if (!sessionId) {
        await connectToDatabricks();
      }
      
      try {
        const response = await axios.get(`${SERVER_URL}/api/projects`, {
          params: { sessionId }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch projects from Databricks:', error);
        // Fallback to mock data on error
        return [...mockProjects];
      }
    }

    // Fallback to mock data
    return [...mockProjects];
  };

  // Function to fetch project details
  const fetchProjectDetails = async (projectId: string): Promise<Project> => {
    const projects = await fetchProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    return project;
  };

  // Function to fetch GL accounts
  const fetchGLAccounts = async (filters?: object): Promise<GLAccount[]> => {
    if (useMockData || connectionType === ConnectionType.MOCK) {
      console.log('Using mock GL account data');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      if (filters) {
        return mockGLAccounts.filter(account => {
          return Object.entries(filters).every(([key, value]) => {
            // @ts-ignore
            return account[key] === value;
          });
        });
      }
      
      return [...mockGLAccounts];
    }

    if (connectionType === ConnectionType.DATABRICKS) {
      if (!sessionId) {
        await connectToDatabricks();
      }
      
      try {
        const response = await axios.get(`${SERVER_URL}/api/gl-accounts`, {
          params: { 
            sessionId,
            ...filters
          }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch GL accounts from Databricks:', error);
        // Fallback to mock data on error
        return [...mockGLAccounts];
      }
    }

    // Fallback to mock data
    return [...mockGLAccounts];
  };

  // Function to fetch transactions
  const fetchTransactions = async (filters: object = {}): Promise<FinancialTransaction[]> => {
    if (useMockData || connectionType === ConnectionType.MOCK) {
      console.log('Using mock transaction data');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      if (Object.keys(filters).length > 0) {
        return mockTransactions.filter(transaction => {
          return Object.entries(filters).every(([key, value]) => {
            // @ts-ignore
            return transaction[key] === value;
          });
        });
      }
      
      return [...mockTransactions];
    }

    if (connectionType === ConnectionType.DATABRICKS) {
      if (!sessionId) {
        await connectToDatabricks();
      }
      
      try {
        const response = await axios.get(`${SERVER_URL}/api/transactions`, {
          params: { 
            sessionId,
            ...filters
          }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch transactions from Databricks:', error);
        // Fallback to mock data on error
        return [...mockTransactions];
      }
    }

    // Fallback to mock data
    return [...mockTransactions];
  };

  // Function to fetch budget entries
  const fetchBudgetEntries = async (filters: object = {}): Promise<BudgetEntry[]> => {
    if (useMockData || connectionType === ConnectionType.MOCK) {
      console.log('Using mock budget data');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      if (Object.keys(filters).length > 0) {
        return mockBudgetEntries.filter(entry => {
          return Object.entries(filters).every(([key, value]) => {
            // @ts-ignore
            return entry[key] === value;
          });
        });
      }
      
      return [...mockBudgetEntries];
    }

    if (connectionType === ConnectionType.DATABRICKS) {
      if (!sessionId) {
        await connectToDatabricks();
      }
      
      try {
        const response = await axios.get(`${SERVER_URL}/api/budget-entries`, {
          params: { 
            sessionId,
            ...filters
          }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch budget entries from Databricks:', error);
        // Fallback to mock data on error
        return [...mockBudgetEntries];
      }
    }

    // Fallback to mock data
    return [...mockBudgetEntries];
  };

  // Provide the context value
  const contextValue = {
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
    executeSqlQuery,
  };

  return (
    <DataContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </DataContext.Provider>
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