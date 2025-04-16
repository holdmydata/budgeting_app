import { DBSQLClient } from '@databricks/sql';
import { KPI, Project, GLAccount, FinancialTransaction, BudgetEntry } from '../types/data';

export interface DatabricksConfig {
  workspaceUrl: string;     // e.g., https://adb-xxx.azuredatabricks.net
  catalogName: string;      // e.g., main, hive_metastore
  schema?: string;          // e.g., default, your_schema_name
  warehouseId?: string;     // SQL warehouse ID
  apiKey?: string;          // Databricks API Key for direct authentication
  httpPath?: string;        // e.g., /sql/1.0/warehouses/xxx
}

/**
 * DatabricksConnector class to handle API key and token-based authentication
 * for connecting to Databricks SQL endpoints using the official driver.
 */
export class DatabricksConnector {
  private config: DatabricksConfig;
  private client: DBSQLClient | null = null;
  private session: any = null;
  
  /**
   * Creates a new DatabricksConnector
   * 
   * @param config The Databricks configuration
   */
  constructor(config: DatabricksConfig) {
    this.config = config;
  }

  /**
   * Connect to Databricks
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.config.workspaceUrl) {
        throw new Error('Workspace URL is required');
      }
      
      if (!this.config.httpPath) {
        throw new Error('HTTP Path is required');
      }

      // Initialize client
      this.client = new DBSQLClient();
      
      // Set up connection options
      const connectOptions: any = {
        host: this.config.workspaceUrl,
        path: this.config.httpPath,
      };
      
      // Use API key if available
      if (this.config.apiKey) {
        connectOptions.token = this.config.apiKey;
      } else {
        // Fall back to OAuth if no API key is provided
        connectOptions.authType = 'databricks-oauth';
      }
      
      // Connect to Databricks
      await this.client.connect(connectOptions);
      
      // Open a session with initial catalog and schema if provided
      const sessionOptions: any = {};
      if (this.config.catalogName) {
        sessionOptions.initialCatalog = this.config.catalogName;
      }
      if (this.config.schema) {
        sessionOptions.initialSchema = this.config.schema;
      }
      
      this.session = await this.client.openSession(sessionOptions);
      
      console.log('Successfully connected to Databricks');
      return true;
    } catch (error) {
      console.error('Failed to connect to Databricks:', error);
      return false;
    }
  }
  
  /**
   * Execute a SQL query against Databricks
   */
  async executeQuery<T>(query: string): Promise<T[]> {
    if (!this.client || !this.session) {
      await this.connect();
      if (!this.client || !this.session) {
        throw new Error('Failed to establish connection to Databricks');
      }
    }
    
    try {
      // Execute the query
      const operation = await this.session.executeStatement(query);
      
      // Fetch all results
      const results = await operation.fetchAll();
      
      // Close the operation to release resources
      await operation.close();
      
      return results as T[];
    } catch (error) {
      console.error('Databricks query execution failed:', error);
      throw error;
    }
  }
  
  /**
   * Close the connection
   */
  async close(): Promise<void> {
    try {
      if (this.session) {
        await this.session.close();
        this.session = null;
      }
      
      if (this.client) {
        await this.client.close();
        this.client = null;
      }
    } catch (error) {
      console.error('Error closing Databricks connection:', error);
    }
  }

  /**
   * Test the connection to Databricks
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('Databricks connection test failed:', error);
      return false;
    }
  }

  /**
   * Fetch dashboard KPIs
   */
  async fetchDashboardKPIs(): Promise<KPI[]> {
    try {
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
      
      return await this.executeQuery<KPI>(query);
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
      throw error;
    }
  }
  
  /**
   * Fetch projects data
   */
  async fetchProjects(): Promise<Project[]> {
    try {
      const query = `
        SELECT 
          id,
          project_code as projectCode,
          project_name as projectName,
          description,
          start_date as startDate,
          end_date as endDate,
          budget,
          spent,
          status,
          owner,
          priority,
          gl_account as glAccount,
          created_at as createdAt,
          updated_at as updatedAt
        FROM projects
      `;
      
      return await this.executeQuery<Project>(query);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }
  
  /**
   * Fetch GL accounts data
   */
  async fetchGLAccounts(): Promise<GLAccount[]> {
    try {
      const query = `
        SELECT 
          id,
          account_number as accountNumber,
          account_name as accountName,
          account_type as accountType,
          is_active as isActive,
          department_id as departmentId,
          created_at as createdAt,
          updated_at as updatedAt
        FROM gl_accounts
      `;
      
      return await this.executeQuery<GLAccount>(query);
    } catch (error) {
      console.error('Failed to fetch GL accounts:', error);
      throw error;
    }
  }
  
  /**
   * Fetch financial transactions
   */
  async fetchTransactions(filters?: Record<string, any>): Promise<FinancialTransaction[]> {
    try {
      // Build WHERE clause based on filters
      const whereClause = filters ? 
        'WHERE ' + Object.entries(filters)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ') :
        '';
      
      const query = `
        SELECT 
          id,
          transaction_date as transactionDate,
          amount,
          description,
          gl_account as glAccount,
          project_id as projectId,
          transaction_type as transactionType,
          vendor_id as vendorId,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM financial_transactions
        ${whereClause}
      `;
      
      return await this.executeQuery<FinancialTransaction>(query);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }
  
  /**
   * Fetch budget entries
   */
  async fetchBudgetEntries(filters?: Record<string, any>): Promise<BudgetEntry[]> {
    try {
      // Build WHERE clause based on filters
      const whereClause = filters ? 
        'WHERE ' + Object.entries(filters)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ') :
        '';
      
      const query = `
        SELECT 
          id,
          gl_account as glAccount,
          fiscal_year as fiscalYear,
          fiscal_period as fiscalPeriod,
          amount,
          project_id as projectId,
          created_at as createdAt,
          updated_at as updatedAt
        FROM budget_entries
        ${whereClause}
      `;
      
      return await this.executeQuery<BudgetEntry>(query);
    } catch (error) {
      console.error('Failed to fetch budget entries:', error);
      throw error;
    }
  }
}

// Create a mock instance for development/testing
export const databricksConnector = {
  executeQuery: async (query: string) => {
    console.log('Mock databricksConnector executing query:', query);
    
    // Return mock data based on the query
    if (query.includes('kpi_view')) {
      return [
        {
          id: 'kpi-1',
          title: 'Total Budget',
          value: 3500000,
          formattedValue: '$3,500,000',
          icon: null,
          change: 0.05,
          secondaryValue: '5% increase YoY'
        },
        {
          id: 'kpi-2',
          title: 'Spent',
          value: 1245000,
          formattedValue: '$1,245,000',
          icon: null,
          change: 0.35,
          secondaryValue: '35.6% of budget'
        },
        {
          id: 'kpi-3',
          title: 'Remaining',
          value: 2255000,
          formattedValue: '$2,255,000',
          icon: null,
          change: 0.644,
          secondaryValue: '64.4% remaining'
        },
        {
          id: 'kpi-4',
          title: 'Projects',
          value: 12,
          formattedValue: '12',
          icon: null,
          change: 0,
          secondaryValue: '3 critical priority'
        }
      ];
    }
    
    // Return empty results by default
    return [];
  }
}; 