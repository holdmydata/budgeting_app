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

// Databricks configuration interface
interface DatabricksConfig {
  workspaceUrl: string;
  catalogName: string;
  schema?: string;
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

// Define the shape of our data context
interface DataContextType {
  isLoading: boolean;
  databricksConfig: DatabricksConfig | null;
  setDatabricksConfig: (config: DatabricksConfig) => void;
  connectToDatabricks: () => Promise<boolean>;
  invalidateQueries: (queryKey: string) => Promise<void>;
  fetchDashboardKPIs: () => Promise<KPI[]>;
  fetchProjects: () => Promise<Project[]>;
  fetchProjectDetails: (projectId: string) => Promise<Project>;
  fetchGLAccounts: () => Promise<GLAccount[]>;
  fetchTransactions: (filters?: object) => Promise<FinancialTransaction[]>;
  fetchBudgetEntries: (filters?: object) => Promise<BudgetEntry[]>;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component that wraps your app and provides the data context
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { acquireToken, getDatabricksToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [databricksConfig, setDatabricksConfig] = useState<DatabricksConfig | null>(null);

  // Helper function to make authenticated API calls
  const fetchWithAuth = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
    if (useMockData) {
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
      const token = await getDatabricksToken();
      if (!token) {
        throw new Error('Not authenticated for Databricks');
      }

      const response = await fetch(`${databricksConfig.workspaceUrl}/api/2.0/sql/statements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          catalog: databricksConfig.catalogName,
          schema: databricksConfig.schema || 'default',
          statement: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Databricks API error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
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

      const testQuery = 'SELECT 1';
      await fetchFromDatabricks<any>(testQuery);
      return true;
    } catch (error) {
      console.error('Databricks connection test failed:', error);
      return false;
    }
  };

  // Function to invalidate and refetch queries
  const invalidateQueries = async (queryKey: string) => {
    await queryClient.invalidateQueries([queryKey]);
  };

  // Data fetching functions
  const fetchDashboardKPIs = async (): Promise<KPI[]> => {
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/kpis`;
    return fetchWithAuth<KPI[]>(apiUrl);
  };

  const fetchProjects = async (): Promise<Project[]> => {
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/projects`;
    return fetchWithAuth<Project[]>(apiUrl);
  };

  const fetchProjectDetails = async (projectId: string): Promise<Project> => {
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/projects/${projectId}`;
    return fetchWithAuth<Project>(apiUrl);
  };

  const fetchGLAccounts = async (): Promise<GLAccount[]> => {
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/gl-accounts`;
    return fetchWithAuth<GLAccount[]>(apiUrl);
  };

  const fetchTransactions = async (filters: object = {}): Promise<FinancialTransaction[]> => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/transactions?${queryParams.toString()}`;
    return fetchWithAuth<FinancialTransaction[]>(apiUrl);
  };

  const fetchBudgetEntries = async (filters: object = {}): Promise<BudgetEntry[]> => {
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
    databricksConfig,
    setDatabricksConfig,
    connectToDatabricks,
    invalidateQueries,
    fetchDashboardKPIs,
    fetchProjects,
    fetchProjectDetails,
    fetchGLAccounts,
    fetchTransactions,
    fetchBudgetEntries
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