// Data models based on Databricks tables

// GL Account Dimension with Type 2 SCD support
export interface GLAccount {
  id: string;               // Surrogate key
  accountNumber: string;    // Natural key (business key)
  accountName: string;
  accountType: string;
  isActive: boolean;
  validFrom: string;       // When this version became active
  validTo: string | null;  // When this version became inactive (null if current)
  isCurrent: boolean;      // Flag for current version
  createdAt: string;
  updatedAt: string;
  // Optional fields for tracking changes
  modifiedBy?: string;     // Who made the change
  changeReason?: string;   // Why the change was made
}

// Helper type for GL Account changes
export interface GLAccountChange {
  accountNumber: string;
  accountName?: string;
  accountType?: string;
  isActive?: boolean;
  changeReason: string;
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
  projectCode: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  owner: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  glAccount: string;
  createdAt: string;
  updatedAt: string;
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
  voucherNumber: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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