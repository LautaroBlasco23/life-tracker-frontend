import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  FinanceSummary,
  Category,
  MonthlyStats,
  TransactionType,
} from '@/types';
import { authService } from './auth-service';

interface ApiResponse<T> {
  message: string;
  data: T;
  count?: number;
  year?: number;
}

class FinanceService {
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  async getCategories(type?: TransactionType): Promise<Category[]> {
    const params = type ? `?type=${type}` : '';
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/categories${params}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result: ApiResponse<Category[]> = await response.json();
    return result.data;
  }

  async getTransactions(
    type?: TransactionType,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (limit) params.append('limit', limit.toString());

    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/transactions?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    const result: ApiResponse<Transaction[]> = await response.json();
    return result.data;
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/transactions/${id}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch transaction');
    }

    const result: ApiResponse<Transaction> = await response.json();
    return result.data;
  }

  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<Transaction> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/transactions`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          date: data.date || new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }

    const result: ApiResponse<Transaction> = await response.json();
    return result.data;
  }

  async updateTransaction(
    id: string,
    data: UpdateTransactionRequest
  ): Promise<Transaction> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/transactions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }

    const result: ApiResponse<Transaction> = await response.json();
    return result.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/transactions/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }
  }

  async getFinanceSummary(
    startDate: string,
    endDate: string
  ): Promise<FinanceSummary> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);

    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/summary?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const result: ApiResponse<FinanceSummary> = await response.json();
    return result.data;
  }

  async getMonthlyStats(year?: number): Promise<MonthlyStats[]> {
    const params = year ? `?year=${year}` : '';
    const response = await authService.makeAuthenticatedRequest(
      `${this.baseUrl}/finances/monthly-stats${params}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch monthly stats');
    }

    const result: ApiResponse<MonthlyStats[]> = await response.json();
    return result.data;
  }
}

export const financeService = new FinanceService();
