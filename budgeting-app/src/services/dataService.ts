import { KPI, GLAccount, Project, FinancialTransaction, BudgetEntry } from '../types/data';
import { mockKPIs, mockGLAccounts, mockProjects, mockTransactions, mockBudgetEntries } from './mockData';
import axios from 'axios';

// Data source types
export enum DataSourceType {
  MOCK = 'mock',
  DATABRICKS = 'databricks',
  API = 'api'
}

// Base configuration interface
export interface DataSourceConfig {
  type: DataSourceType;
}

// Databricks specific configuration
export interface DatabricksConfig extends DataSourceConfig {
  type: DataSourceType.DATABRICKS;
  workspaceUrl: string;
  warehouseId: string;
  httpPath: string;
  catalog: string;
  schema: string;
  apiKey?: string;
}

// API specific configuration
export interface ApiConfig extends DataSourceConfig {
  type: DataSourceType.API;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

// Mock data configuration
export interface MockConfig extends DataSourceConfig {
  type: DataSourceType.MOCK;
  delayMs?: number; // Simulate network delay
}

// Union type for all configurations
export type DataConfig = DatabricksConfig | ApiConfig | MockConfig;

// Global data service class
export class DataService {
  private static instance: DataService;
  private config: DataConfig;
  private sessionId: string | null = null;
  private serverUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  private graphqlUrl: string = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5000/graphql';

  // Private constructor for singleton pattern
  private constructor(config: DataConfig) {
    this.config = config;
  }

  // Get singleton instance
  public static getInstance(config?: DataConfig): DataService {
    if (!DataService.instance) {
      if (!config) {
        // Default to mock config if none provided
        config = { type: DataSourceType.MOCK, delayMs: 500 };
      }
      DataService.instance = new DataService(config);
    } else if (config) {
      // Update config if provided
      DataService.instance.setConfig(config);
    }
    return DataService.instance;
  }

  // Update configuration
  public async setConfig(config: DataConfig): Promise<void> {
    // If we were previously connected to Databricks, disconnect
    if (this.config?.type === DataSourceType.DATABRICKS && this.sessionId) {
      await this.disconnectFromDatabricks();
    }
    
    this.config = config;
    
    // Initialize new connections if needed
    if (config.type === DataSourceType.DATABRICKS) {
      // Initialize Databricks connection through server
      await this.connectToDatabricks(config as DatabricksConfig);
    }
  }

  // Connect to Databricks via the server
  private async connectToDatabricks(config: DatabricksConfig): Promise<void> {
    try {
      const response = await axios.post(`${this.serverUrl}/api/databricks/connect`, {
        workspaceUrl: config.workspaceUrl,
        httpPath: config.httpPath,
        warehouseId: config.warehouseId,
        catalog: config.catalog,
        schema: config.schema,
        apiKey: config.apiKey
      });
      
      if (response.data.success) {
        this.sessionId = response.data.sessionId;
        console.log('Connected to Databricks via server, session ID:', this.sessionId);
      } else {
        throw new Error(response.data.message || 'Failed to connect to Databricks');
      }
    } catch (error) {
      console.error('Failed to connect to Databricks via server:', error);
      throw error;
    }
  }
  
  // Disconnect from Databricks
  private async disconnectFromDatabricks(): Promise<void> {
    if (!this.sessionId) return;
    
    try {
      await axios.post(`${this.serverUrl}/api/databricks/disconnect`, {
        sessionId: this.sessionId
      });
      
      this.sessionId = null;
    } catch (error) {
      console.error('Error disconnecting from Databricks:', error);
    }
  }

  // Simulate delay for mock data
  private async mockDelay(): Promise<void> {
    if (this.config.type === DataSourceType.MOCK) {
      const mockConfig = this.config as MockConfig;
      const delayMs = mockConfig.delayMs || 0;
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  // Test the Databricks connection
  public async testDatabricksConnection(config: DatabricksConfig): Promise<boolean> {
    try {
      const response = await axios.post(`${this.serverUrl}/api/databricks/test`, {
        workspaceUrl: config.workspaceUrl,
        httpPath: config.httpPath,
        warehouseId: config.warehouseId,
        catalog: config.catalog,
        schema: config.schema,
        apiKey: config.apiKey
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Databricks connection test failed:', error);
      return false;
    }
  }

  // Fetch KPIs
  public async fetchKPIs(): Promise<KPI[]> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return [...mockKPIs];
          
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          
          const response = await axios.get(`${this.serverUrl}/api/kpis`, {
            params: {
              sessionId: this.sessionId
            }
          });
          
          return response.data;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.get(`${apiConfig.baseUrl}/api/kpis`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      // Fallback to mock data
      return [...mockKPIs];
    }
  }

  // Fetch GL Accounts
  public async fetchGLAccounts(filters?: Record<string, any>): Promise<GLAccount[]> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          let accounts = [...mockGLAccounts];
          
          // Apply filters if provided
          if (filters) {
            accounts = accounts.filter(account => 
              Object.entries(filters).every(([key, value]) => 
                // @ts-ignore - Dynamic property access
                account[key] === value
              )
            );
          }
          
          return accounts;
          
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          
          const response = await axios.get(`${this.serverUrl}/api/gl-accounts`, {
            params: {
              sessionId: this.sessionId,
              ...filters
            }
          });
          
          return response.data;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.get(`${apiConfig.baseUrl}/api/gl-accounts`, {
            params: filters,
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching GL accounts:', error);
      // Fallback to mock data
      return [...mockGLAccounts];
    }
  }

  // Fetch Projects
  public async fetchProjects(filters?: Record<string, any>): Promise<Project[]> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          let projects = [...mockProjects];
          
          // Apply filters if provided
          if (filters) {
            projects = projects.filter(project => 
              Object.entries(filters).every(([key, value]) => 
                // @ts-ignore - Dynamic property access
                project[key] === value
              )
            );
          }
          
          return projects;
          
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          
          const response = await axios.get(`${this.serverUrl}/api/projects`, {
            params: {
              sessionId: this.sessionId,
              ...filters
            }
          });
          
          return response.data;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.get(`${apiConfig.baseUrl}/api/projects`, {
            params: filters,
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to mock data
      return [...mockProjects];
    }
  }

  // Fetch Project by ID
  public async fetchProjectById(id: string): Promise<Project | null> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return mockProjects.find(project => project.id === id) || null;
          
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          
          const response = await axios.get(`${this.serverUrl}/api/projects`, {
            params: {
              sessionId: this.sessionId,
              id
            }
          });
          
          return response.data.length > 0 ? response.data[0] : null;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.get(`${apiConfig.baseUrl}/api/projects/${id}`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      // Fallback to mock data
      return mockProjects.find(project => project.id === id) || null;
    }
  }

  // Fetch Transactions
  public async fetchTransactions(filters?: Record<string, any>): Promise<FinancialTransaction[]> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          let transactions = [...mockTransactions];
          
          // Apply filters if provided
          if (filters) {
            transactions = transactions.filter(transaction => 
              Object.entries(filters).every(([key, value]) => 
                // @ts-ignore - Dynamic property access
                transaction[key] === value
              )
            );
          }
          
          return transactions;
          
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          
          const response = await axios.get(`${this.serverUrl}/api/transactions`, {
            params: {
              sessionId: this.sessionId,
              ...filters
            }
          });
          
          return response.data;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.get(`${apiConfig.baseUrl}/api/transactions`, {
            params: filters,
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to mock data
      return [...mockTransactions];
    }
  }

  // Fetch Budget Entries
  public async fetchBudgetEntries(filters?: Record<string, any>): Promise<BudgetEntry[]> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          let entries = [...mockBudgetEntries];
          
          // Apply filters if provided
          if (filters) {
            entries = entries.filter(entry => 
              Object.entries(filters).every(([key, value]) => 
                // @ts-ignore - Dynamic property access
                entry[key] === value
              )
            );
          }
          
          return entries;
          
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          
          const response = await axios.get(`${this.serverUrl}/api/budget-entries`, {
            params: {
              sessionId: this.sessionId,
              ...filters
            }
          });
          
          return response.data;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.get(`${apiConfig.baseUrl}/api/budget-entries`, {
            params: filters,
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching budget entries:', error);
      // Fallback to mock data
      return [...mockBudgetEntries];
    }
  }

  // Execute custom query
  public async executeQuery<T>(query: string): Promise<T[]> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          throw new Error('Custom queries are not supported with mock data');
          
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          
          const response = await axios.post(`${this.serverUrl}/api/databricks/query`, {
            sessionId: this.sessionId,
            query
          });
          
          return response.data.data;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.post(`${apiConfig.baseUrl}/api/query`, {
            query
          }, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error executing custom query:', error);
      throw error;
    }
  }

  // Cleanup function - call when application closes
  public async cleanup(): Promise<void> {
    if (this.config.type === DataSourceType.DATABRICKS && this.sessionId) {
      await this.disconnectFromDatabricks();
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance(); 