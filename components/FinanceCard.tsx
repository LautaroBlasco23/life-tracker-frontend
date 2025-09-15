"use client"

import type { Finance } from "@/models"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface FinanceCardProps {
  finance: Finance
}

export function FinanceCard({ finance }: FinanceCardProps) {
  const isIncome = finance.type === "income"
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(finance.amount)

  const formattedDate = finance.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                isIncome ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              {isIncome ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">{finance.title}</h3>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${isIncome ? "text-green-400" : "text-red-400"}`}>
              {isIncome ? "+" : "-"}
              {formattedAmount}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{finance.type}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
