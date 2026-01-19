export type TransactionType = 'income' | 'outcome';
export type TransactionFrequency = 'fixed' | 'variable';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  applicableToFreq: TransactionFrequency;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: number;
  type: TransactionType;
  frequency: TransactionFrequency;
  amount: number;
  categoryId: number;
  categoryName: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  frequency: TransactionFrequency;
  amount: number;
  categoryId: number;
  description?: string;
  date?: string;
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  frequency?: TransactionFrequency;
  amount?: number;
  categoryId?: number;
  description?: string;
  date?: string;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  total: number;
  percentage: number;
  count: number;
}

export interface FinanceSummary {
  totalIncome: number;
  totalOutcome: number;
  balance: number;
  incomeByCategory: CategorySummary[];
  outcomeByCategory: CategorySummary[];
  period: string;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalIncome: number;
  totalOutcome: number;
  balance: number;
  transactionCount: number;
}
