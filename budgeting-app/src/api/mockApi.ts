import { 
  GLAccount, 
  Project, 
  User, 
  FinancialTransaction, 
  BudgetEntry, 
  KPI,
  CalculationRollup
} from '../types/data';
import { databricksConnector } from './databricksConnector';

/**
 * Mock API for development
 * 
 * This service provides mock data for development purposes.
 * In production, this would be replaced with actual API calls to Azure Functions
 * that connect to Databricks.
 */
class MockApiService {
  // GL Accounts
  async getGLAccounts(): Promise<GLAccount[]> {
    // Use the databricksConnector to get mock GL accounts
    const result = await databricksConnector.executeQuery('SELECT * FROM gl_dimension');
    return result.map(item => ({
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

  async getGLAccount(id: string): Promise<GLAccount> {
    const accounts = await this.getGLAccounts();
    const account = accounts.find(acc => acc.id === id);
    
    if (!account) {
      throw new Error(`GL Account with ID ${id} not found`);
    }
    
    return account;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const result = await databricksConnector.executeQuery('SELECT * FROM project_dimension');
    return result.map(item => ({
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

  async getProject(id: string): Promise<Project> {
    const projects = await this.getProjects();
    const project = projects.find(proj => proj.id === id);
    
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    return project;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    // Simulate creating a project
    const newId = Math.floor(Math.random() * 10000).toString();
    const now = new Date().toISOString();
    
    return {
      id: newId,
      ...project,
      createdAt: now,
      updatedAt: now
    } as Project;
  }

  // Transactions
  async getTransactions(filters: Record<string, any> = {}): Promise<FinancialTransaction[]> {
    let query = 'SELECT * FROM fact_actuals';
    
    // Build WHERE clause based on filters
    if (Object.keys(filters).length > 0) {
      const whereConditions = Object.entries(filters)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      
      query += ` WHERE ${whereConditions}`;
    }
    
    const result = await databricksConnector.executeQuery(query);
    return result as FinancialTransaction[];
  }

  // Budget entries
  async getBudgetEntries(filters: Record<string, any> = {}): Promise<BudgetEntry[]> {
    let query = 'SELECT * FROM fact_budget';
    
    // Build WHERE clause based on filters
    if (Object.keys(filters).length > 0) {
      const whereConditions = Object.entries(filters)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      
      query += ` WHERE ${whereConditions}`;
    }
    
    const result = await databricksConnector.executeQuery(query);
    return result as BudgetEntry[];
  }

  // Analytics and KPIs
  async getDashboardKPIs(): Promise<KPI[]> {
    const result = await databricksConnector.executeQuery('SELECT * FROM kpi_view');
    return result as KPI[];
  }

  async getBudgetVsActualAnalytics(fiscalYear: number): Promise<CalculationRollup[]> {
    const query = `SELECT * FROM calculation_table 
      WHERE calculationType = 'budget_vs_actual' 
      AND fiscalYear = ${fiscalYear}`;
      
    const result = await databricksConnector.executeQuery(query);
    return result as CalculationRollup[];
  }

  async getProjectPerformance(projectId?: string): Promise<CalculationRollup[]> {
    let query = `SELECT * FROM calculation_table 
      WHERE calculationType = 'project_performance'`;
    
    if (projectId) {
      query += ` AND projectId = '${projectId}'`;
    }
    
    const result = await databricksConnector.executeQuery(query);
    return result as CalculationRollup[];
  }

  // Login simulation
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    // This is just a mock - in reality, you'd use Azure AD or other auth
    if (username === 'admin' && password === 'password') {
      return {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          fullName: 'Admin User',
          department: 'IT',
          role: 'Administrator',
          securityGroups: ['Admins', 'Users'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    
    throw new Error('Invalid username or password');
  }
}

// Create and export a singleton instance
export const mockApi = new MockApiService();

// Export mock data for direct use
export const mockGLAccounts = {
  '1': 'IT Software Licenses',
  '2': 'IT Hardware',
  '3': 'IT Cloud Services',
  '4': 'IT Consulting',
  '5': 'IT Training',
  '6': 'IT Support Services',
  '7': 'Network Infrastructure',
  '8': 'Data Center Equipment'
};

export const mockProjects = [
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
  }
];

export const mockDashboardData = {
  kpis: [
    {
      id: "1",
      name: "Total Budget",
      description: "Total budget allocated for IT projects",
      value: 12500000,
      target: 15000000,
      unit: "USD",
      trend: "up",
      category: "financial",
      dateRange: "2024",
      lastUpdated: new Date().toISOString(),
      title: "Total Budget",
      formattedValue: "$12.5M",
      secondaryValue: "$15M target",
    },
    {
      id: "2",
      name: "Project Completion Rate",
      description: "Percentage of projects completed on time",
      value: 78,
      target: 85,
      unit: "%",
      trend: "up",
      category: "project",
      dateRange: "2024",
      lastUpdated: new Date().toISOString(),
      title: "Project Completion",
      formattedValue: "78%",
      secondaryValue: "85% target",
    }
  ]
}; 