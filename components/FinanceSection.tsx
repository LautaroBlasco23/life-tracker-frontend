"use client"

import type { Finance } from "@/models"
import { FinanceCard } from "./FinanceCard"

interface FinanceSectionProps {
  type: "income" | "outcome"
  finances: Finance[]
}

const sectionLabels = {
  income: "Income",
  outcome: "Expenses",
}

const sectionIcons = {
  income: "💰",
  outcome: "💸",
}

export function FinanceSection({ type, finances }: FinanceSectionProps) {
  if (finances.length === 0) {
    return null
  }

  const totalAmount = finances.reduce((sum, finance) => sum + finance.amount, 0)
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{sectionIcons[type]}</span>
          <h2 className="text-xl font-semibold text-foreground">{sectionLabels[type]}</h2>
          <div className="flex-1 h-px bg-border ml-3"></div>
        </div>
        <div className="text-right">
          <p className={`font-bold ${type === "income" ? "text-green-400" : "text-red-400"}`}>{formattedTotal}</p>
          <p className="text-xs text-muted-foreground">{finances.length} entries</p>
        </div>
      </div>
      <div className="grid gap-3">
        {finances.map((finance) => (
          <FinanceCard key={finance.id} finance={finance} />
        ))}
      </div>
    </div>
  )
}
