export type TransactionType = 'income' | 'outcome';
export type TransactionFrequency = 'fixed' | 'variable';
export type PaymentFrequency = 'monthly' | 'bimonthly' | 'yearly';

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
  paymentFrequency?: PaymentFrequency;
  amount: number;
  categoryId: number;
  categoryName: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  id: string;
  amount: number;
  date: string;
}

export interface FixedTransaction {
  id: string;
  type: TransactionType;
  paymentFrequency: PaymentFrequency;
  categoryId: number;
  categoryName: string;
  description?: string;
  totalPaid: number;
  payments?: PaymentSummary[];
  currentPeriodPayment?: PaymentSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  transactionId: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  frequency: TransactionFrequency;
  paymentFrequency?: PaymentFrequency;
  amount: number;
  categoryId: number;
  description?: string;
  date?: string;
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  frequency?: TransactionFrequency;
  paymentFrequency?: PaymentFrequency;
  amount?: number;
  categoryId?: number;
  description?: string;
  date?: string;
}

export interface CreatePaymentRequest {
  transactionId: string;
  amount: number;
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
