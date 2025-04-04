// Data models based on Databricks tables

// GL Account Dimension
export interface GLAccount {
  id: string;
  number: string;
  name: string;
  description: string;
  budgetedAmount: number;
  spentAmount: number;
  availableAmount: number;
}

// Date Dimension
export interface DateDimension {
  dateId: string;
  fullDate: string;
  dayOfWeek: number;
  dayName: string;
  dayOfMonth: number;
  dayOfYear: number;
  weekOfYear: number;
  monthName: string;
  monthNumber: number;
  quarterNumber: number;
  year: number;
  fiscalQuarter: number;
  fiscalYear: number;
}

// User Dimension
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  department: string;
  role: string;
  securityGroups: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Project Dimension
export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  owner: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

// GL Project Mapping
export interface GLProjectMapping {
  id: string;
  glAccountId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Financial Transaction (Actuals)
export interface FinancialTransaction {
  id: string;
  date: string;
  vendor: string;
  description: string;
  amount: number;
  glAccount: string;
  project: string;
  status: 'Pending' | 'Approved' | 'Processed' | 'Rejected';
}

// Budget Planning
export interface BudgetEntry {
  id: string;
  fiscalYear: string;
  glAccount: string;
  amount: number;
  allocatedAmount: number;
  remainingAmount: number;
  description: string;
}

// Calculation/Rollup Table
export interface CalculationRollup {
  id: string;
  calculationType: 'budget_vs_actual' | 'project_performance' | 'department_spending';
  dateId: string;
  glAccountId?: string;
  projectId?: string;
  departmentId?: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  createdAt: string;
  updatedAt: string;
}

// Vendor Profile
export interface Vendor {
  id: string;
  vendorName: string;
  vendorCode: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  category: string;
  performanceScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Department
export interface Department {
  id: string;
  departmentName: string;
  departmentCode: string;
  managerId: string;
  parentDepartmentId?: string;
  budgetAllocation: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dashboard KPI
export interface KPI {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  icon: React.ReactNode | null;
  change?: number;
  secondaryValue?: string;
} 