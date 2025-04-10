import axios, { AxiosRequestConfig } from 'axios';
import { 
  GLAccount, 
  Project, 
  Vendor, 
  FinancialTransaction 
} from '../types/data';

export interface DatabricksQueryOptions {
  catalog?: string;
  schema?: string;
  warehouse_id?: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

export class DatabricksApi {
  private baseUrl: string;
  private token: string;
  private defaultOptions: DatabricksQueryOptions;

  constructor(baseUrl: string, token: string, defaultOptions: DatabricksQueryOptions = {}) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.defaultOptions = defaultOptions;
  }

  private async executeQuery<T>(statement: string, options: DatabricksQueryOptions = {}): Promise<T[]> {
    const response = await axios.post(`${this.baseUrl}/api/2.0/sql/statements`, {
      statement,
      warehouse_id: options.warehouse_id || this.defaultOptions.warehouse_id,
      catalog: options.catalog || this.defaultOptions.catalog,
      schema: options.schema || this.defaultOptions.schema,
      parameters: options.parameters || {},
      wait_timeout: options.timeout || 60,
      byte_limit: 1024 * 1024 * 10, // 10MB limit
    }, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'error') {
      throw new Error(`Databricks query error: ${response.data.error}`);
    }

    return response.data.results;
  }

  // Projects
  async getProjects(options?: DatabricksQueryOptions): Promise<Project[]> {
    const query = `
      SELECT 
        id,
        project_code as projectCode,
        project_name as projectName,
        description,
        start_date as startDate,
        end_date as endDate,
        budget,
        status,
        manager_id as managerId,
        department_id as departmentId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM projects
    `;
    
    return this.executeQuery<Project>(query, options);
  }

  // GL Accounts
  async getGLAccounts(options?: DatabricksQueryOptions): Promise<GLAccount[]> {
    const query = `
      SELECT 
        id,
        account_number as accountNumber,
        account_name as accountName,
        account_type as accountType,
        is_active as isActive,
        valid_from as validFrom,
        valid_to as validTo,
        is_current as isCurrent,
        created_at as createdAt,
        updated_at as updatedAt
      FROM gl_accounts
    `;
    
    return this.executeQuery<GLAccount>(query, options);
  }

  // Transactions
  async getTransactions(options?: DatabricksQueryOptions): Promise<FinancialTransaction[]> {
    const query = `
      SELECT 
        t.id,
        t.date,
        t.amount,
        t.description,
        t.reference,
        t.gl_account_id as glAccountId,
        t.project_id as projectId,
        t.vendor_id as vendorId,
        t.user_id as userId,
        t.created_at as createdAt,
        t.updated_at as updatedAt,
        -- Join related data if needed
        g.account_name as glAccountName,
        p.project_name as projectName,
        v.vendor_name as vendorName
      FROM transactions t
      LEFT JOIN gl_accounts g ON t.gl_account_id = g.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN vendors v ON t.vendor_id = v.id
    `;
    
    return this.executeQuery<FinancialTransaction>(query, options);
  }

  // Custom Query Execution
  async executeCustomQuery<T>(query: string, options?: DatabricksQueryOptions): Promise<T[]> {
    return this.executeQuery<T>(query, options);
  }
} 