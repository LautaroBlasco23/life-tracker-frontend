import type { Finance } from "../models/finance"

export class FinanceService {
  static getMockFinances(): Finance[] {
    return [
      {
        id: "1",
        title: "Salary",
        amount: 5000,
        type: "income",
        date: new Date("2024-01-01"),
      },
      {
        id: "2",
        title: "Freelance Project",
        amount: 1200,
        type: "income",
        date: new Date("2024-01-15"),
      },
      {
        id: "3",
        title: "Rent",
        amount: 1500,
        type: "outcome",
        date: new Date("2024-01-01"),
      },
      {
        id: "4",
        title: "Groceries",
        amount: 300,
        type: "outcome",
        date: new Date("2024-01-10"),
      },
      {
        id: "5",
        title: "Utilities",
        amount: 150,
        type: "outcome",
        date: new Date("2024-01-05"),
      },
    ]
  }

  static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  static createFinance(financeData: Omit<Finance, "id">): Finance {
    return {
      id: this.generateId(),
      ...financeData,
    }
  }

  static updateFinance(finances: Finance[], id: string, updates: Partial<Finance>): Finance[] {
    return finances.map((finance) => (finance.id === id ? { ...finance, ...updates } : finance))
  }

  static deleteFinance(finances: Finance[], id: string): Finance[] {
    return finances.filter((finance) => finance.id !== id)
  }

  static getFinanceById(finances: Finance[], id: string): Finance | undefined {
    return finances.find((finance) => finance.id === id)
  }

  static getFinancesByType(finances: Finance[], type: Finance["type"]): Finance[] {
    return finances.filter((finance) => finance.type === type)
  }

  static getTotalIncome(finances: Finance[]): number {
    return finances.filter((finance) => finance.type === "income").reduce((total, finance) => total + finance.amount, 0)
  }

  static getTotalExpenses(finances: Finance[]): number {
    return finances
      .filter((finance) => finance.type === "outcome")
      .reduce((total, finance) => total + finance.amount, 0)
  }

  static getNetBalance(finances: Finance[]): number {
    return this.getTotalIncome(finances) - this.getTotalExpenses(finances)
  }
}
