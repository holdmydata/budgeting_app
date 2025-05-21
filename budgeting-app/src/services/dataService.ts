import { KPI, GLAccount, Project, FinancialTransaction, BudgetEntry } from '../types/data';
import {
  mockKPIs,
  mockGLAccounts,
  mockProjects,
  mockTransactions,
  mockBudgetEntries,
  mockUserProfile,
  mockUserSettings,
  mockDashboardYieldData,
  mockDashboardBudgetDistribution,
  mockDashboardSustainabilityData,
  mockDashboardProjectData,
  mockVendors,
  mockGLAccountLookup,
  mockProjectLookup,
  mockVendorLookup
} from './mockData';
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
  private usingMockFallback: boolean = false;

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
          this.usingMockFallback = false;
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
          
          this.usingMockFallback = false;
          return response.data;
          
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const apiResponse = await axios.get(`${apiConfig.baseUrl}/api/kpis`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          
          this.usingMockFallback = false;
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      this.usingMockFallback = true;
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
          this.usingMockFallback = false;
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
          
          this.usingMockFallback = false;
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
          
          this.usingMockFallback = false;
          return apiResponse.data;
          
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching GL accounts:', error);
      this.usingMockFallback = true;
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
          // Use GraphQL
          const query = `
            query Projects($sessionId: String!, $status: String, $priority: String) {
              projects(sessionId: $sessionId, status: $status, priority: $priority) {
                id
                projectCode
                projectName
                description
                startDate
                endDate
                budget
                spent
                status
                owner
                priority
                glAccount
                createdAt
                updatedAt
              }
            }
          `;
          const variables: any = { sessionId: this.sessionId };
          if (filters?.status) variables.status = filters.status;
          if (filters?.priority) variables.priority = filters.priority;
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
          });
          const json = await res.json();
          return json.data.projects;
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
      this.usingMockFallback = true;
      return [...mockProjects];
    }
  }

  public async addProject(input: Partial<Project>): Promise<Project> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const newProject = { ...input, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Project;
          mockProjects.push(newProject);
          return newProject;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation AddProject($sessionId: String!, $input: ProjectInput!) {
              addProject(sessionId: $sessionId, input: $input) {
                id
                projectCode
                projectName
                description
                startDate
                endDate
                budget
                spent
                status
                owner
                priority
                glAccount
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.addProject;
        case DataSourceType.API:
          throw new Error('API addProject not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  public async updateProject(id: string, input: Partial<Project>): Promise<Project> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockProjects.findIndex(p => p.id === id);
          if (idx === -1) throw new Error('Project not found');
          mockProjects[idx] = { ...mockProjects[idx], ...input, updatedAt: new Date().toISOString() };
          return mockProjects[idx];
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation UpdateProject($sessionId: String!, $id: ID!, $input: ProjectInput!) {
              updateProject(sessionId: $sessionId, id: $id, input: $input) {
                id
                projectCode
                projectName
                description
                startDate
                endDate
                budget
                spent
                status
                owner
                priority
                glAccount
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, id, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.updateProject;
        case DataSourceType.API:
          throw new Error('API updateProject not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  public async deleteProject(id: string): Promise<boolean> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockProjects.findIndex(p => p.id === id);
          if (idx === -1) return false;
          mockProjects.splice(idx, 1);
          return true;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation DeleteProject($sessionId: String!, $id: ID!) {
              deleteProject(sessionId: $sessionId, id: $id)
            }
          `;
          const variables = { sessionId: this.sessionId, id };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.deleteProject;
        case DataSourceType.API:
          throw new Error('API deleteProject not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
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
      this.usingMockFallback = true;
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
      this.usingMockFallback = true;
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
      this.usingMockFallback = true;
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

  // Fetch user profile
  public async fetchUserProfile(): Promise<any> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return { ...mockUserProfile };
        case DataSourceType.DATABRICKS:
        case DataSourceType.API:
          // Example endpoint, adjust as needed
          const apiConfig = this.config as ApiConfig;
          const response = await axios.get(`${apiConfig.baseUrl}/api/user/profile`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          return response.data;
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      this.usingMockFallback = true;
      return { ...mockUserProfile };
    }
  }

  // Fetch user settings
  public async fetchUserSettings(): Promise<any> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return { ...mockUserSettings };
        case DataSourceType.DATABRICKS:
        case DataSourceType.API:
          // Example endpoint, adjust as needed
          const apiConfig = this.config as ApiConfig;
          const response = await axios.get(`${apiConfig.baseUrl}/api/user/settings`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          return response.data;
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      this.usingMockFallback = true;
      return { ...mockUserSettings };
    }
  }

  // Fetch dashboard chart data
  public async fetchDashboardChartData(): Promise<any> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return {
            yieldData: [...mockDashboardYieldData],
            budgetDistribution: [...mockDashboardBudgetDistribution],
            sustainabilityData: [...mockDashboardSustainabilityData],
            projectData: [...mockDashboardProjectData]
          };
        case DataSourceType.DATABRICKS:
        case DataSourceType.API:
          // Example endpoint, adjust as needed
          const apiConfig = this.config as ApiConfig;
          const response = await axios.get(`${apiConfig.baseUrl}/api/dashboard/chart-data`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          return response.data;
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching dashboard chart data:', error);
      this.usingMockFallback = true;
      return {
        yieldData: [...mockDashboardYieldData],
        budgetDistribution: [...mockDashboardBudgetDistribution],
        sustainabilityData: [...mockDashboardSustainabilityData],
        projectData: [...mockDashboardProjectData]
      };
    }
  }

  // Fetch Vendors
  public async fetchVendors(filters?: Record<string, any>): Promise<any[]> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          let vendors = [...mockVendors];
          if (filters) {
            vendors = vendors.filter(vendor => 
              Object.entries(filters).every(([key, value]) => 
                // @ts-ignore - Dynamic property access
                vendor[key] === value
              )
            );
          }
          return vendors;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          // Use GraphQL
          const query = `
            query Vendors($sessionId: String!, $isActive: Boolean, $category: String) {
              vendors(sessionId: $sessionId, isActive: $isActive, category: $category) {
                id
                vendorCode
                vendorName
                category
                contactName
                contactEmail
                contactPhone
                performanceScore
                isActive
                createdAt
                updatedAt
              }
            }
          `;
          const variables: any = { sessionId: this.sessionId };
          if (filters?.isActive !== undefined) variables.isActive = filters.isActive;
          if (filters?.category) variables.category = filters.category;
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables })
          });
          const json = await res.json();
          return json.data.vendors;
        case DataSourceType.API:
          const apiConfig = this.config as ApiConfig;
          const response = await axios.get(`${apiConfig.baseUrl}/api/vendors`, {
            params: filters,
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          return response.data;
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      this.usingMockFallback = true;
      return [...mockVendors];
    }
  }

  public async addVendor(input: Partial<any>): Promise<any> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const newVendor = {
            id: Date.now().toString(),
            vendorName: input.vendorName || '',
            vendorCode: input.vendorCode || '',
            category: input.category || '',
            contactName: input.contactName || '',
            contactEmail: input.contactEmail || '',
            contactPhone: input.contactPhone || '',
            performanceScore: input.performanceScore ?? 0,
            isActive: input.isActive ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockVendors.push(newVendor);
          return newVendor;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation AddVendor($sessionId: String!, $input: VendorInput!) {
              addVendor(sessionId: $sessionId, input: $input) {
                id
                vendorCode
                vendorName
                category
                contactName
                contactEmail
                contactPhone
                performanceScore
                isActive
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.addVendor;
        case DataSourceType.API:
          throw new Error('API addVendor not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  }

  public async updateVendor(id: string, input: Partial<any>): Promise<any> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockVendors.findIndex(v => v.id === id);
          if (idx === -1) throw new Error('Vendor not found');
          mockVendors[idx] = { ...mockVendors[idx], ...input, updatedAt: new Date().toISOString() };
          return mockVendors[idx];
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation UpdateVendor($sessionId: String!, $id: ID!, $input: VendorInput!) {
              updateVendor(sessionId: $sessionId, id: $id, input: $input) {
                id
                vendorCode
                vendorName
                category
                contactName
                contactEmail
                contactPhone
                performanceScore
                isActive
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, id, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.updateVendor;
        case DataSourceType.API:
          throw new Error('API updateVendor not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  public async deleteVendor(id: string): Promise<boolean> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockVendors.findIndex(v => v.id === id);
          if (idx === -1) return false;
          mockVendors.splice(idx, 1);
          return true;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation DeleteVendor($sessionId: String!, $id: ID!) {
              deleteVendor(sessionId: $sessionId, id: $id)
            }
          `;
          const variables = { sessionId: this.sessionId, id };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.deleteVendor;
        case DataSourceType.API:
          throw new Error('API deleteVendor not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  // Fetch GL Account Lookup
  public async fetchGLAccountLookup(): Promise<Record<string, string>> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return { ...mockGLAccountLookup };
        case DataSourceType.DATABRICKS:
        case DataSourceType.API:
          // Example endpoint, adjust as needed
          const apiConfig = this.config as ApiConfig;
          const response = await axios.get(`${apiConfig.baseUrl}/api/gl-account-lookup`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          return response.data;
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching GL Account lookup:', error);
      this.usingMockFallback = true;
      return { ...mockGLAccountLookup };
    }
  }

  // Fetch Project Lookup
  public async fetchProjectLookup(): Promise<Record<string, string>> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return { ...mockProjectLookup };
        case DataSourceType.DATABRICKS:
        case DataSourceType.API:
          // Example endpoint, adjust as needed
          const apiConfig = this.config as ApiConfig;
          const response = await axios.get(`${apiConfig.baseUrl}/api/project-lookup`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          return response.data;
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching Project lookup:', error);
      this.usingMockFallback = true;
      return { ...mockProjectLookup };
    }
  }

  // Fetch Vendor Lookup
  public async fetchVendorLookup(): Promise<Record<string, string>> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          return { ...mockVendorLookup };
        case DataSourceType.DATABRICKS:
        case DataSourceType.API:
          // Example endpoint, adjust as needed
          const apiConfig = this.config as ApiConfig;
          const response = await axios.get(`${apiConfig.baseUrl}/api/vendor-lookup`, {
            headers: {
              ...(apiConfig.headers || {}),
              ...(apiConfig.apiKey ? { 'Authorization': `Bearer ${apiConfig.apiKey}` } : {})
            }
          });
          return response.data;
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error fetching Vendor lookup:', error);
      this.usingMockFallback = true;
      return { ...mockVendorLookup };
    }
  }

  // Cleanup function - call when application closes
  public async cleanup(): Promise<void> {
    if (this.config.type === DataSourceType.DATABRICKS && this.sessionId) {
      await this.disconnectFromDatabricks();
    }
  }

  public isUsingMockFallback(): boolean {
    return this.usingMockFallback;
  }

  public async addTransaction(input: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const newTransaction = { ...input, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as FinancialTransaction;
          mockTransactions.push(newTransaction);
          return newTransaction;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation AddTransaction($sessionId: String!, $input: TransactionInput!) {
              addTransaction(sessionId: $sessionId, input: $input) {
                id
                transactionDate
                amount
                description
                glAccount
                projectId
                transactionType
                vendorId
                status
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.addTransaction;
        case DataSourceType.API:
          throw new Error('API addTransaction not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  public async updateTransaction(id: string, input: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockTransactions.findIndex(t => t.id === id);
          if (idx === -1) throw new Error('Transaction not found');
          mockTransactions[idx] = { ...mockTransactions[idx], ...input, updatedAt: new Date().toISOString() };
          return mockTransactions[idx];
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation UpdateTransaction($sessionId: String!, $id: ID!, $input: TransactionInput!) {
              updateTransaction(sessionId: $sessionId, id: $id, input: $input) {
                id
                transactionDate
                amount
                description
                glAccount
                projectId
                transactionType
                vendorId
                status
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, id, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.updateTransaction;
        case DataSourceType.API:
          throw new Error('API updateTransaction not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  public async deleteTransaction(id: string): Promise<boolean> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockTransactions.findIndex(t => t.id === id);
          if (idx === -1) return false;
          mockTransactions.splice(idx, 1);
          return true;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation DeleteTransaction($sessionId: String!, $id: ID!) {
              deleteTransaction(sessionId: $sessionId, id: $id)
            }
          `;
          const variables = { sessionId: this.sessionId, id };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.deleteTransaction;
        case DataSourceType.API:
          throw new Error('API deleteTransaction not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  public async addBudgetEntry(input: Partial<BudgetEntry>): Promise<BudgetEntry> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const newEntry = { ...input, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as BudgetEntry;
          mockBudgetEntries.push(newEntry);
          return newEntry;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation CreateBudgetEntry($sessionId: String!, $input: BudgetEntryInput!) {
              createBudgetEntry(sessionId: $sessionId, input: $input) {
                id
                glAccount
                projectId
                fiscalYear
                fiscalMonth
                amount
                notes
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.createBudgetEntry;
        case DataSourceType.API:
          throw new Error('API addBudgetEntry not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error adding budget entry:', error);
      throw error;
    }
  }

  public async updateBudgetEntry(id: string, input: Partial<BudgetEntry>): Promise<BudgetEntry> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockBudgetEntries.findIndex(e => e.id === id);
          if (idx === -1) throw new Error('Budget entry not found');
          mockBudgetEntries[idx] = { ...mockBudgetEntries[idx], ...input, updatedAt: new Date().toISOString() };
          return mockBudgetEntries[idx];
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation UpdateBudgetEntry($sessionId: String!, $id: ID!, $input: BudgetEntryUpdateInput!) {
              updateBudgetEntry(sessionId: $sessionId, id: $id, input: $input) {
                id
                glAccount
                projectId
                fiscalYear
                fiscalMonth
                amount
                notes
                createdAt
                updatedAt
              }
            }
          `;
          const variables = { sessionId: this.sessionId, id, input };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.updateBudgetEntry;
        case DataSourceType.API:
          throw new Error('API updateBudgetEntry not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error updating budget entry:', error);
      throw error;
    }
  }

  public async deleteBudgetEntry(id: string): Promise<boolean> {
    try {
      const configType = this.config.type;
      switch (configType) {
        case DataSourceType.MOCK:
          await this.mockDelay();
          const idx = mockBudgetEntries.findIndex(e => e.id === id);
          if (idx === -1) return false;
          mockBudgetEntries.splice(idx, 1);
          return true;
        case DataSourceType.DATABRICKS:
          if (!this.sessionId) {
            await this.connectToDatabricks(this.config as DatabricksConfig);
          }
          const mutation = `
            mutation DeleteBudgetEntry($sessionId: String!, $id: ID!) {
              deleteBudgetEntry(sessionId: $sessionId, id: $id)
            }
          `;
          const variables = { sessionId: this.sessionId, id };
          const res = await fetch(this.graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: mutation, variables })
          });
          const json = await res.json();
          return json.data.deleteBudgetEntry;
        case DataSourceType.API:
          throw new Error('API deleteBudgetEntry not implemented');
        default:
          throw new Error(`Unsupported data source type: ${configType}`);
      }
    } catch (error) {
      console.error('Error deleting budget entry:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance(); 