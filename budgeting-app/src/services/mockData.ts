// Mock data for the budgeting app when APIs are unavailable
import { KPI, GLAccount, Project, FinancialTransaction, BudgetEntry } from '../types/data';

// Mock KPI data
export const mockKPIs: KPI[] = [
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

// Mock GL Account data
export const mockGLAccounts: GLAccount[] = [
  { 
    id: 'gl-1', 
    number: '6010', 
    name: 'IT Equipment', 
    description: 'Hardware purchases including servers, laptops, and peripherals',
    budgetedAmount: 500000,
    spentAmount: 275000,
    availableAmount: 225000
  },
  { 
    id: 'gl-2', 
    number: '6020', 
    name: 'Software Licenses', 
    description: 'Annual software subscriptions and one-time license purchases',
    budgetedAmount: 350000,
    spentAmount: 290000,
    availableAmount: 60000
  },
  { 
    id: 'gl-3', 
    number: '6030', 
    name: 'IT Services', 
    description: 'Consulting, implementation, and managed services',
    budgetedAmount: 450000,
    spentAmount: 210000,
    availableAmount: 240000
  },
  { 
    id: 'gl-4', 
    number: '6040', 
    name: 'Cloud Infrastructure', 
    description: 'AWS, Azure, and GCP hosting and services',
    budgetedAmount: 600000,
    spentAmount: 250000,
    availableAmount: 350000
  },
  { 
    id: 'gl-5', 
    number: '6050', 
    name: 'Network & Telecom', 
    description: 'Network equipment, ISP services, and telecommunications',
    budgetedAmount: 300000,
    spentAmount: 120000,
    availableAmount: 180000
  }
];

// Mock Projects data
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'ERP Implementation',
    description: 'Implementation of new ERP system across all departments',
    startDate: '2023-01-15',
    endDate: '2023-12-31',
    budget: 850000,
    spent: 450000,
    status: 'In Progress',
    owner: 'John Smith',
    priority: 'High'
  },
  {
    id: 'proj-2',
    name: 'Network Infrastructure Upgrade',
    description: 'Upgrade of corporate network infrastructure and security',
    startDate: '2023-03-01',
    endDate: '2023-09-30',
    budget: 500000,
    spent: 380000,
    status: 'In Progress',
    owner: 'Lisa Johnson',
    priority: 'Critical'
  },
  {
    id: 'proj-3',
    name: 'Cloud Migration',
    description: 'Migration of on-premise applications to cloud infrastructure',
    startDate: '2023-02-15',
    endDate: '2024-02-14',
    budget: 750000,
    spent: 275000,
    status: 'In Progress',
    owner: 'Michael Chen',
    priority: 'High'
  },
  {
    id: 'proj-4',
    name: 'Security Enhancement Program',
    description: 'Implementation of enhanced security controls and monitoring',
    startDate: '2023-04-01',
    endDate: '2023-12-31',
    budget: 450000,
    spent: 190000,
    status: 'In Progress',
    owner: 'Sarah Williams',
    priority: 'Critical'
  }
];

// Mock transactions data
export const mockTransactions: FinancialTransaction[] = [
  {
    id: 'tx-1',
    date: '2023-05-15',
    vendor: 'Microsoft',
    description: 'Azure Cloud Services - April',
    amount: 45000,
    glAccount: '6040',
    project: 'proj-3',
    status: 'Processed'
  },
  {
    id: 'tx-2',
    date: '2023-05-12',
    vendor: 'Dell',
    description: 'Server Hardware for Data Center',
    amount: 125000,
    glAccount: '6010',
    project: 'proj-4',
    status: 'Processed'
  },
  {
    id: 'tx-3',
    date: '2023-05-10',
    vendor: 'SAP',
    description: 'ERP Annual License',
    amount: 180000,
    glAccount: '6020',
    project: 'proj-1',
    status: 'Processed'
  },
  {
    id: 'tx-4',
    date: '2023-05-08',
    vendor: 'Cisco',
    description: 'Network Equipment - Phase 1',
    amount: 230000,
    glAccount: '6050',
    project: 'proj-2',
    status: 'Processed'
  },
  {
    id: 'tx-5',
    date: '2023-05-05',
    vendor: 'Accenture',
    description: 'Consulting Services - April',
    amount: 85000,
    glAccount: '6030',
    project: 'proj-1',
    status: 'Processed'
  }
];

// Mock budget entries
export const mockBudgetEntries: BudgetEntry[] = [
  {
    id: 'budget-1',
    fiscalYear: '2023',
    glAccount: '6010',
    amount: 500000,
    allocatedAmount: 275000,
    remainingAmount: 225000,
    description: 'IT Equipment budget for FY23'
  },
  {
    id: 'budget-2',
    fiscalYear: '2023',
    glAccount: '6020',
    amount: 350000,
    allocatedAmount: 290000,
    remainingAmount: 60000,
    description: 'Software Licenses budget for FY23'
  },
  {
    id: 'budget-3',
    fiscalYear: '2023',
    glAccount: '6030',
    amount: 450000,
    allocatedAmount: 210000,
    remainingAmount: 240000,
    description: 'IT Services budget for FY23'
  },
  {
    id: 'budget-4',
    fiscalYear: '2023',
    glAccount: '6040',
    amount: 600000,
    allocatedAmount: 250000,
    remainingAmount: 350000,
    description: 'Cloud Infrastructure budget for FY23'
  },
  {
    id: 'budget-5',
    fiscalYear: '2023',
    glAccount: '6050',
    amount: 300000,
    allocatedAmount: 120000,
    remainingAmount: 180000,
    description: 'Network & Telecom budget for FY23'
  }
]; 