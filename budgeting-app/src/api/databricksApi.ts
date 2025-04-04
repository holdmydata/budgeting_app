import axios, { AxiosRequestConfig } from 'axios';
import { 
  GLAccount, 
  Project, 
  Vendor, 
  FinancialTransaction 
} from '../types/data';

interface DatabricksQueryOptions {
  catalog?: string;
  schema?: string;
}

class DatabricksApi {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.get<T>(`${this.baseUrl}${url}`, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  // @ts-ignore - Will be used in future implementations
  private async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.post<T>(`${this.baseUrl}${url}`, data, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  // @ts-ignore - Will be used in future implementations
  private async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.put<T>(`${this.baseUrl}${url}`, data, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  // Projects
  async getProjects(options?: DatabricksQueryOptions): Promise<Project[]> {
    const response = await this.get<any[]>('/sql/statements', {
      params: {
        catalog: options?.catalog,
        schema: options?.schema,
        statement: 'SELECT * FROM projects'
      }
    });
    return response.map(item => ({
      id: item.id,
      projectCode: item.project_code,
      projectName: item.project_name,
      description: item.description,
      startDate: item.start_date,
      endDate: item.end_date,
      budget: item.budget,
      status: item.status,
      managerId: item.manager_id,
      departmentId: item.department_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  // GL Accounts
  async getGLAccounts(options?: DatabricksQueryOptions): Promise<GLAccount[]> {
    const response = await this.get<any[]>('/sql/statements', {
      params: {
        catalog: options?.catalog,
        schema: options?.schema,
        statement: 'SELECT * FROM gl_accounts'
      }
    });
    return response.map(item => ({
      id: item.id,
      accountNumber: item.account_number,
      accountName: item.account_name,
      accountType: item.account_type,
      isActive: item.is_active,
      departmentId: item.department_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  // Expenses
  async getExpenses(options?: DatabricksQueryOptions): Promise<FinancialTransaction[]> {
    const response = await this.get<any[]>('/sql/statements', {
      params: {
        catalog: options?.catalog,
        schema: options?.schema,
        statement: 'SELECT * FROM expenses'
      }
    });
    return response.map(item => ({
      id: item.id,
      transactionDate: item.transaction_date,
      glAccountId: item.gl_account_id,
      projectId: item.project_id,
      amount: item.amount,
      description: item.description,
      reference: item.reference,
      vendorId: item.vendor_id,
      userId: item.user_id,
      dateId: item.date_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  // Vendors
  async getVendors(options?: DatabricksQueryOptions): Promise<Vendor[]> {
    const response = await this.get<any[]>('/sql/statements', {
      params: {
        catalog: options?.catalog,
        schema: options?.schema,
        statement: 'SELECT * FROM vendors'
      }
    });
    return response.map(item => ({
      id: item.id,
      vendorName: item.vendor_name,
      vendorCode: item.vendor_code,
      contactName: item.contact_name,
      contactEmail: item.contact_email,
      contactPhone: item.contact_phone,
      category: item.category,
      performanceScore: item.performance_score,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }
}

export default DatabricksApi; 