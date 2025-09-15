"use client"

import type { Finance } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinanceSummaryProps {
  finances: Finance[]
}

export function FinanceSummary({ finances }: FinanceSummaryProps) {
  const totalIncome = finances.filter((f) => f.type === "income").reduce((sum, f) => sum + f.amount, 0)

  const totalExpenses = finances.filter((f) => f.type === "outcome").reduce((sum, f) => sum + f.amount, 0)

  const netBalance = totalIncome - totalExpenses

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-lg font-bold ${netBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
