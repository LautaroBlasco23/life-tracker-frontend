import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  FinanceSummary
} from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

class FinanceService {
  private getAuthToken(): string | null {
    return localStorage.getItem("token")
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken()
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getTransactionsByUserId(): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch transactions" }))
      throw new Error(error.message || "Failed to fetch transactions")
    }

    return response.json()
  }

  async getTransactionById(id: number): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch transaction" }))
      throw new Error(error.message || "Failed to fetch transaction")
    }

    return response.json()
  }

  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        date: data.date || new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create transaction" }))
      throw new Error(error.message || "Failed to create transaction")
    }

    return response.json()
  }

  async updateTransaction(id: number, data: UpdateTransactionRequest): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update transaction" }))
      throw new Error(error.message || "Failed to update transaction")
    }

    return response.json()
  }

  async deleteTransaction(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to delete transaction" }))
      throw new Error(error.message || "Failed to delete transaction")
    }
  }

  async getFinanceSummary(startDate?: string, endDate?: string): Promise<FinanceSummary> {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    const response = await fetch(`${API_BASE_URL}/transactions/summary?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to fetch summary" }))
      throw new Error(error.message || "Failed to fetch summary")
    }

    return response.json()
  }
}

export const financeService = new FinanceService()
