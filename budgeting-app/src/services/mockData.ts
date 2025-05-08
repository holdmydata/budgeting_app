// Mock data for the budgeting app when APIs are unavailable
import { KPI, GLAccount, Project, FinancialTransaction, BudgetEntry, Vendor } from '../types/data';

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
    accountNumber: '6010',
    accountName: 'IT Equipment',
    accountType: 'Expense',
    isActive: true,
    validFrom: '2023-01-01T00:00:00Z',
    validTo: null,
    isCurrent: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  { 
    id: 'gl-2',
    accountNumber: '6020',
    accountName: 'Software Licenses',
    accountType: 'Expense',
    isActive: true,
    validFrom: '2023-01-01T00:00:00Z',
    validTo: null,
    isCurrent: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  { 
    id: 'gl-3',
    accountNumber: '6030',
    accountName: 'IT Services',
    accountType: 'Expense',
    isActive: true,
    validFrom: '2023-01-01T00:00:00Z',
    validTo: null,
    isCurrent: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  { 
    id: 'gl-4',
    accountNumber: '6040',
    accountName: 'Cloud Infrastructure',
    accountType: 'Expense',
    isActive: true,
    validFrom: '2023-01-01T00:00:00Z',
    validTo: null,
    isCurrent: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  { 
    id: 'gl-5',
    accountNumber: '6050',
    accountName: 'Network & Telecom',
    accountType: 'Expense',
    isActive: true,
    validFrom: '2023-01-01T00:00:00Z',
    validTo: null,
    isCurrent: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

// Mock Projects data
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    projectCode: 'ERP-2023',
    projectName: 'ERP Implementation',
    description: 'Implementation of new ERP system across all departments',
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2023-12-31T00:00:00Z',
    budget: 850000,
    spent: 450000,
    status: 'In Progress',
    owner: 'John Smith',
    priority: 'High',
    glAccount: '6020',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'proj-2',
    projectCode: 'NET-2023',
    projectName: 'Network Infrastructure Upgrade',
    description: 'Upgrade of corporate network infrastructure and security',
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2023-09-30T00:00:00Z',
    budget: 500000,
    spent: 380000,
    status: 'In Progress',
    owner: 'Lisa Johnson',
    priority: 'Critical',
    glAccount: '6050',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'proj-3',
    projectCode: 'CLOUD-2023',
    projectName: 'Cloud Migration',
    description: 'Migration of on-premise applications to cloud infrastructure',
    startDate: '2023-02-15T00:00:00Z',
    endDate: '2024-02-14T00:00:00Z',
    budget: 750000,
    spent: 275000,
    status: 'In Progress',
    owner: 'Michael Chen',
    priority: 'High',
    glAccount: '6040',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'proj-4',
    projectCode: 'SEC-2023',
    projectName: 'Security Enhancement Program',
    description: 'Implementation of enhanced security controls and monitoring',
    startDate: '2023-04-01T00:00:00Z',
    endDate: '2023-12-31T00:00:00Z',
    budget: 450000,
    spent: 190000,
    status: 'In Progress',
    owner: 'Sarah Williams',
    priority: 'Critical',
    glAccount: '6030',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

// Lookup data for GL Accounts (maps account number to name)
export const mockGLAccountLookup: Record<string, string> = {
  '6010': 'IT Equipment',
  '6020': 'Software Licenses',
  '6030': 'IT Services',
  '6040': 'Cloud Infrastructure',
  '6050': 'Network & Telecom'
};

// Lookup data for Projects (maps project id to name)
export const mockProjectLookup: Record<string, string> = {
  'proj-1': 'ERP Implementation',
  'proj-2': 'Network Infrastructure Upgrade',
  'proj-3': 'Cloud Migration',
  'proj-4': 'Security Enhancement Program'
};

// Lookup data for Vendors (maps vendor id to name)
export const mockVendorLookup: Record<string, string> = {
  'vendor-1': 'Microsoft',
  'vendor-2': 'Dell',
  'vendor-3': 'SAP',
  'vendor-4': 'Cisco',
  'vendor-5': 'Accenture'
};

// Update mockTransactions to match our schema
export const mockTransactions: FinancialTransaction[] = [
  {
    id: 'tx-1',
    date: '2023-05-15T00:00:00Z',
    vendor: 'vendor-1',
    description: 'Azure Cloud Services - April',
    amount: 45000,
    glAccount: '6040',
    project: 'proj-3',
    status: 'Processed',
    voucherNumber: 'INV-2023-001',
    userId: 'user-1',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T10:30:00Z'
  },
  {
    id: 'tx-2',
    date: '2023-05-12T00:00:00Z',
    vendor: 'vendor-2',
    description: 'Server Hardware for Data Center',
    amount: 125000,
    glAccount: '6010',
    project: 'proj-4',
    status: 'Processed',
    voucherNumber: 'PO-2023-001',
    userId: 'user-2',
    createdAt: '2023-05-12T14:20:00Z',
    updatedAt: '2023-05-12T14:20:00Z'
  },
  {
    id: 'tx-3',
    date: '2023-05-10T00:00:00Z',
    vendor: 'vendor-3',
    description: 'ERP Annual License',
    amount: 180000,
    glAccount: '6020',
    project: 'proj-1',
    status: 'Processed',
    voucherNumber: 'INV-2023-002',
    userId: 'user-1',
    createdAt: '2023-05-10T09:15:00Z',
    updatedAt: '2023-05-10T09:15:00Z'
  },
  {
    id: 'tx-4',
    date: '2023-05-08T00:00:00Z',
    vendor: 'vendor-4',
    description: 'Network Equipment - Phase 1',
    amount: 230000,
    glAccount: '6050',
    project: 'proj-2',
    status: 'Processed',
    voucherNumber: 'PO-2023-002',
    userId: 'user-3',
    createdAt: '2023-05-08T11:45:00Z',
    updatedAt: '2023-05-08T11:45:00Z'
  },
  {
    id: 'tx-5',
    date: '2023-05-05T00:00:00Z',
    vendor: 'vendor-5',
    description: 'Consulting Services - April',
    amount: 85000,
    glAccount: '6030',
    project: 'proj-1',
    status: 'Processed',
    voucherNumber: 'INV-2023-003',
    userId: 'user-2',
    createdAt: '2023-05-05T16:30:00Z',
    updatedAt: '2023-05-05T16:30:00Z'
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

export const mockVendors: Vendor[] = [
  {
    id: '1',
    vendorName: 'Acme Tech Solutions',
    vendorCode: 'VEN-001',
    contactName: 'John Smith',
    contactEmail: 'john@acmetech.com',
    contactPhone: '(555) 123-4567',
    category: 'Software',
    performanceScore: 4.5,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z'
  },
  {
    id: '2',
    vendorName: 'DataSphere Inc.',
    vendorCode: 'VEN-002',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@datasphere.com',
    contactPhone: '(555) 987-6543',
    category: 'Cloud Services',
    performanceScore: 5.0,
    isActive: true,
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z'
  },
  {
    id: '3',
    vendorName: 'AgriTech Hardware Co.',
    vendorCode: 'VEN-003',
    contactName: 'Michael Brown',
    contactEmail: 'michael@agritech.com',
    contactPhone: '(555) 234-5678',
    category: 'Hardware',
    performanceScore: 3.8,
    isActive: true,
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-02-20T00:00:00Z'
  },
  {
    id: '4',
    vendorName: 'FarmSys Consulting',
    vendorCode: 'VEN-004',
    contactName: 'Emily Davis',
    contactEmail: 'emily@farmsys.com',
    contactPhone: '(555) 345-6789',
    category: 'Consulting',
    performanceScore: 4.2,
    isActive: true,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-03-15T00:00:00Z'
  },
  {
    id: '5',
    vendorName: 'Network Solutions Ltd.',
    vendorCode: 'VEN-005',
    contactName: 'Robert Wilson',
    contactEmail: 'robert@networksol.com',
    contactPhone: '(555) 456-7890',
    category: 'Network',
    performanceScore: 4.0,
    isActive: false,
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2023-02-25T00:00:00Z'
  },
  {
    id: '6',
    vendorName: 'Security Pro Partners',
    vendorCode: 'VEN-006',
    contactName: 'Amanda Martinez',
    contactEmail: 'amanda@securitypro.com',
    contactPhone: '(555) 567-8901',
    category: 'Security',
    performanceScore: 4.7,
    isActive: true,
    createdAt: '2023-01-25T00:00:00Z',
    updatedAt: '2023-03-20T00:00:00Z'
  }
];