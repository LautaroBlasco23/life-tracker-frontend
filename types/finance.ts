export type TransactionType = "income" | "expense"
export type TransactionCategory =
  | "salary" | "freelance" | "investment" | "other_income"
  | "food" | "transport" | "utilities" | "entertainment" | "health" | "shopping" | "other_expense"

export interface Transaction {
  id: number
  userId: number
  title: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionRequest {
  title: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date?: string
}

export interface UpdateTransactionRequest {
  title?: string
  description?: string
  amount?: number
  type?: TransactionType
  category?: TransactionCategory
  date?: string
}

export interface FinanceSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  period: string
}
