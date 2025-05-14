// Type definitions for GraphQL resolvers and context in the server

export interface KPI {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  change: number;
  secondaryValue: string;
}

export interface GLAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  isActive: boolean;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: string;
  owner: string;
  priority: string;
  glAccount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  transactionDate: string;
  amount: number;
  description: string;
  glAccount: string;
  projectId: string;
  transactionType: string;
  vendorId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetEntry {
  id: string;
  glAccount: string;
  projectId: string;
  fiscalYear: number;
  fiscalMonth: number;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQLContext {
  req: import('express').Request;
}

// Example resolver argument type
type ResolverArgs<T> = {
  sessionId: string;
} & Partial<T>; 