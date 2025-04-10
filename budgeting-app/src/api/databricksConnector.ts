/**
 * Databricks SQL Connection
 * 
 * This module handles direct connections to Databricks SQL 
 * using the Databricks REST API.
 */

import { GLAccount, Project, FinancialTransaction } from '../types/data';
import axios from 'axios';

// In a real implementation, we would use the Databricks JavaScript SDK
// or access the Databricks SQL REST API via Azure Functions

export interface DatabricksQueryOptions {
  catalog?: string;
  schema?: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

export interface DatabricksConfig {
  token: string;
  workspaceUrl: string;
  computeHost?: string;
  httpPath?: string;
  warehouseId?: string;
  catalog?: string;
  schema?: string;
  port?: number;
  useSSL?: boolean;
}

export class DatabricksConnector {
  private config: DatabricksConfig | null = null;
  private useMockData = true; // Set this to false to use real Databricks connection

  constructor(config?: DatabricksConfig) {
    if (config) {
      this.config = config;
      this.useMockData = false;
    }
  }

  setConfig(config: DatabricksConfig) {
    this.config = config;
    this.useMockData = false;
  }

  /**
   * Execute a SQL query against Databricks SQL
   * 
   * @param sql SQL query to execute
   * @param options Query options
   * @returns Query results
   */
  async executeQuery(sql: string, options: DatabricksQueryOptions = {}): Promise<any[]> {
    if (this.useMockData) {
      console.log('Using mock data instead of real Databricks connection');
      return this.mockDatabricksResponse(sql);
    }

    if (!this.config) {
      throw new Error('Databricks configuration not set');
    }

    try {
      const endpoint = `${this.config.workspaceUrl}/api/2.0/sql/statements`;
      
      const response = await axios.post(endpoint, {
        catalog: options.catalog || this.config.catalog,
        schema: options.schema || this.config.schema || 'default',
        warehouse_id: this.config.warehouseId,
        statement: sql,
        parameters: options.parameters || {},
        wait_timeout: options.timeout || 60,
        byte_limit: 1024 * 1024 * 10, // 10MB limit
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'error') {
        throw new Error(`Databricks query error: ${response.data.error}`);
      }

      return Array.isArray(response.data.results) ? response.data.results : [response.data];
    } catch (error) {
      console.error('Databricks query failed:', error);
      throw error;
    }
  }

  /**
   * Test the Databricks connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1');
      return true;
    } catch (error) {
      console.error('Databricks connection test failed:', error);
      return false;
    }
  }

  /**
   * Mock response for Databricks SQL queries during development
   */
  private mockDatabricksResponse(sql: string): Promise<any[]> {
    // Parse the SQL to determine what kind of data to return
    const sqlLower = sql.toLowerCase();
    
    // Sleep to simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return mock data based on the query
        if (sqlLower.includes('gl_dimension') || sqlLower.includes('gl_accounts')) {
          resolve(this.getMockGLAccounts());
        } else if (sqlLower.includes('project_dimension') || sqlLower.includes('projects')) {
          resolve(this.getMockProjects());
        } else if (sqlLower.includes('fact_actuals') || sqlLower.includes('transactions')) {
          resolve(this.getMockTransactions());
        } else if (sqlLower.includes('fact_budget') || sqlLower.includes('budget')) {
          resolve(this.getMockBudgetEntries());
        } else if (sqlLower.includes('calculation_table') || sqlLower.includes('kpi')) {
          resolve(this.getMockKPIs());
        } else {
          // Generic empty response
          resolve([]);
        }
      }, 300); // Simulate 300ms latency
    });
  }

  // Mock data generators
  private getMockGLAccounts(): GLAccount[] {
    return [
      { 
        id: "1", 
        accountNumber: "1000", 
        accountName: "Cash", 
        accountType: "Asset", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "2", 
        accountNumber: "1010", 
        accountName: "Accounts Receivable", 
        accountType: "Asset", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "3", 
        accountNumber: "2000", 
        accountName: "Accounts Payable", 
        accountType: "Liability", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "4", 
        accountNumber: "3000", 
        accountName: "Revenue", 
        accountType: "Revenue", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "5", 
        accountNumber: "4000", 
        accountName: "Expenses", 
        accountType: "Expense", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "6", 
        accountNumber: "4100", 
        accountName: "Salaries", 
        accountType: "Expense", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "7", 
        accountNumber: "4200", 
        accountName: "Marketing", 
        accountType: "Expense", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "8", 
        accountNumber: "4300", 
        accountName: "Office Supplies", 
        accountType: "Expense", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "9", 
        accountNumber: "4400", 
        accountName: "Travel", 
        accountType: "Expense", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "10", 
        accountNumber: "4500", 
        accountName: "IT Infrastructure", 
        accountType: "Expense", 
        isActive: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
    ];
  }

  private getMockProjects(): Project[] {
    return [
      { 
        id: "1", 
        projectCode: "PRJ-001", 
        projectName: "IT Infrastructure Upgrade", 
        description: "Upgrade company IT infrastructure",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        budget: 300000,
        status: "active",
        managerId: "1",
        departmentId: "1",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "2", 
        projectCode: "PRJ-002", 
        projectName: "Marketing Campaign", 
        description: "Q3 marketing campaign for new product",
        startDate: "2023-07-01",
        endDate: "2023-09-30",
        budget: 150000,
        status: "active",
        managerId: "2",
        departmentId: "2",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "3", 
        projectCode: "PRJ-003", 
        projectName: "Office Renovation", 
        description: "Headquarters office renovation",
        startDate: "2023-03-01",
        endDate: "2023-05-31",
        budget: 200000,
        status: "completed",
        managerId: "3",
        departmentId: "3",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "4", 
        projectCode: "PRJ-004", 
        projectName: "Employee Training", 
        description: "Annual employee skills training",
        startDate: "2023-06-01",
        endDate: "2023-12-31",
        budget: 80000,
        status: "active",
        managerId: "4",
        departmentId: "4",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
      { 
        id: "5", 
        projectCode: "PRJ-005", 
        projectName: "Product Development", 
        description: "New product line development",
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        budget: 450000,
        status: "active",
        managerId: "5",
        departmentId: "5",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01"
      },
    ];
  }

  private getMockTransactions(): FinancialTransaction[] {
    return [
      {
        id: "1",
        transactionDate: "2023-08-15",
        glAccountId: "6",
        projectId: "1",
        amount: 45000,
        description: "IT Staff Salaries - August",
        reference: "PAY-20230815",
        userId: "1",
        dateId: "20230815",
        createdAt: "2023-08-15",
        updatedAt: "2023-08-15"
      },
      {
        id: "2",
        transactionDate: "2023-08-20",
        glAccountId: "10",
        projectId: "1",
        amount: 85000,
        description: "Server Hardware Purchase",
        reference: "PO-20230820",
        vendorId: "1",
        userId: "1",
        dateId: "20230820",
        createdAt: "2023-08-20",
        updatedAt: "2023-08-20"
      },
      {
        id: "3",
        transactionDate: "2023-08-05",
        glAccountId: "7",
        projectId: "2",
        amount: 35000,
        description: "Digital Advertising - August",
        reference: "PO-20230805",
        vendorId: "2",
        userId: "2",
        dateId: "20230805",
        createdAt: "2023-08-05",
        updatedAt: "2023-08-05"
      },
      {
        id: "4",
        transactionDate: "2023-08-10",
        glAccountId: "7",
        projectId: "2",
        amount: 42000,
        description: "Print Advertising - August",
        reference: "PO-20230810",
        vendorId: "3",
        userId: "2",
        dateId: "20230810",
        createdAt: "2023-08-10",
        updatedAt: "2023-08-10"
      },
      {
        id: "5",
        transactionDate: "2023-08-25",
        glAccountId: "8",
        projectId: "4",
        amount: 8500,
        description: "Training Materials",
        reference: "PO-20230825",
        vendorId: "4",
        userId: "4",
        dateId: "20230825",
        createdAt: "2023-08-25",
        updatedAt: "2023-08-25"
      },
    ];
  }

  private getMockBudgetEntries(): any[] {
    return [
      {
        id: "1",
        fiscalYear: 2023,
        fiscalQuarter: 3,
        fiscalMonth: 7,
        glAccountId: "6",
        projectId: "1",
        amount: 50000,
        approvalStatus: "approved",
        approvedById: "1",
        createdById: "1"
      },
      {
        id: "2",
        fiscalYear: 2023,
        fiscalQuarter: 3,
        fiscalMonth: 8,
        glAccountId: "6",
        projectId: "1",
        amount: 50000,
        approvalStatus: "approved",
        approvedById: "1",
        createdById: "1"
      },
      {
        id: "3",
        fiscalYear: 2023,
        fiscalQuarter: 3,
        fiscalMonth: 9,
        glAccountId: "6",
        projectId: "1",
        amount: 50000,
        approvalStatus: "approved",
        approvedById: "1",
        createdById: "1"
      },
      {
        id: "4",
        fiscalYear: 2023,
        fiscalQuarter: 3,
        fiscalMonth: 7,
        glAccountId: "10",
        projectId: "1",
        amount: 100000,
        approvalStatus: "approved",
        approvedById: "1",
        createdById: "1"
      },
      {
        id: "5",
        fiscalYear: 2023,
        fiscalQuarter: 3,
        fiscalMonth: 7,
        glAccountId: "7",
        projectId: "2",
        amount: 50000,
        approvalStatus: "approved",
        approvedById: "1",
        createdById: "2"
      },
      {
        id: "6",
        fiscalYear: 2023,
        fiscalQuarter: 3,
        fiscalMonth: 8,
        glAccountId: "7",
        projectId: "2",
        amount: 50000,
        approvalStatus: "approved",
        approvedById: "1",
        createdById: "2"
      },
      {
        id: "7",
        fiscalYear: 2023,
        fiscalQuarter: 3,
        fiscalMonth: 9,
        glAccountId: "7",
        projectId: "2",
        amount: 50000,
        approvalStatus: "approved",
        approvedById: "1",
        createdById: "2"
      },
    ];
  }

  private getMockKPIs(): any[] {
    return [
      {
        id: "1",
        name: "Total Budget",
        description: "Current fiscal year budget",
        value: 1200000,
        target: 1200000,
        unit: "$",
        trend: "flat",
        category: "financial",
        dateRange: "FY 2023",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "2",
        name: "Expenses YTD",
        description: "Year to date expenses",
        value: 680000,
        target: 800000,
        unit: "$",
        trend: "up",
        category: "financial",
        dateRange: "FY 2023",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "3",
        name: "Budget Utilization",
        description: "Percentage of budget spent",
        value: 56.7,
        target: 70,
        unit: "%",
        trend: "up",
        category: "financial",
        dateRange: "FY 2023",
        lastUpdated: new Date().toISOString()
      },
      {
        id: "4",
        name: "Active Projects",
        description: "Number of active projects",
        value: 12,
        target: 15,
        unit: "",
        trend: "up",
        category: "project",
        dateRange: "Current",
        lastUpdated: new Date().toISOString()
      }
    ];
  }
}

// Create and export a singleton instance with mock values
export const databricksConnector = new DatabricksConnector(); 