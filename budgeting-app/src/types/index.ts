export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  period: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface BudgetEntry {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
  status: 'on-track' | 'over-budget' | 'under-budget';
} 