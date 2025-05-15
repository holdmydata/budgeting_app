/**
 * Data mapping utility that converts between different data model formats
 * to ensure compatibility across the application
 */

import { KPI, GLAccount, Project, FinancialTransaction, BudgetEntry } from '../types/data';

// Helper function to convert property names when working with different model versions
export function mapGLAccount(data: any): GLAccount {
  // Handle older format with accountNumber, accountName, etc.
  return {
    id: data.id || '',
    accountNumber: data.accountNumber || data.number || '',
    accountName: data.accountName || data.name || '',
    accountType: data.accountType || '',
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
    validFrom: data.validFrom || '',
    validTo: typeof data.validTo !== 'undefined' ? data.validTo : null,
    isCurrent: typeof data.isCurrent === 'boolean' ? data.isCurrent : true,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || '',
    modifiedBy: data.modifiedBy,
    changeReason: data.changeReason
  };
}

export function mapProject(data: any): Project {
  return {
    id: data.id || '',
    projectCode: data.projectCode || '',
    projectName: data.projectName || data.name || '',
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    budget: typeof data.budget === 'number' ? data.budget : 0,
    spent: typeof data.spent === 'number' ? data.spent : 0,
    status: mapProjectStatus(data.status),
    owner: data.owner || data.managerId || 'Unassigned',
    priority: mapProjectPriority(data.priority),
    glAccount: data.glAccount || '',
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || ''
  };
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

function mapProjectPriority(priority: string): 'Low' | 'Medium' | 'High' | 'Critical' {
  switch ((priority || '').toLowerCase()) {
    case 'low':
      return 'Low';
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    default:
      return 'Medium';
  }
} 