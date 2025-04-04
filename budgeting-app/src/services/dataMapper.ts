/**
 * Data mapping utility that converts between different data model formats
 * to ensure compatibility across the application
 */

import { KPI, GLAccount, Project, FinancialTransaction, BudgetEntry } from '../types/data';

// Helper function to convert property names when working with different model versions
export function mapGLAccount(data: any): GLAccount {
  // Handle older format with accountNumber, accountName, etc.
  if (data.accountNumber) {
    return {
      id: data.id,
      number: data.accountNumber,
      name: data.accountName,
      description: data.description || data.accountType || '',
      budgetedAmount: data.budgetedAmount || 0,
      spentAmount: data.spentAmount || 0,
      availableAmount: data.availableAmount || 0
    };
  }
  
  // Already in the new format
  return data;
}

export function mapProject(data: any): Project {
  // Handle older format with projectCode, projectName, etc.
  if (data.projectCode || data.projectName) {
    return {
      id: data.id,
      name: data.projectName || data.name,
      description: data.description || '',
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget || 0,
      spent: data.spent || 0,
      status: mapProjectStatus(data.status),
      owner: data.owner || data.managerId || 'Unassigned',
      priority: data.priority || 'Medium'
    };
  }
  
  // Already in the new format
  return data;
}

// Map between different status values
function mapProjectStatus(status: string): 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled' {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'in progress':
      return 'In Progress';
    case 'planned':
      return 'Planned';
    case 'completed':
      return 'Completed';
    case 'onhold':
    case 'on hold':
      return 'On Hold';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Planned';
  }
} 