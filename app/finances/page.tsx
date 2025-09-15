"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { BottomNavigation } from "@/components/BottomNavigation"
import { FinanceSection } from "@/components/FinanceSection"
import { FinanceSummary } from "@/components/FinanceSummary"
import { NewFinanceModal } from "@/components/NewFinanceModal"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/AppContext"
import { FINANCE_TYPES } from "@/constants"

export default function FinancesPage() {
  const { state, dispatch } = useAppContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const groupedFinances = FINANCE_TYPES.reduce(
    (acc, type) => {
      acc[type] = state.finances.filter((finance) => finance.type === type)
      return acc
    },
    {} as Record<string, typeof state.finances>,
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Finances</h1>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} className="mr-1" />
            Add Entry
          </Button>
        </div>

        <div className="space-y-6">
          <FinanceSummary finances={state.finances} />

          <div className="space-y-8">
            <FinanceSection type="income" finances={groupedFinances.income || []} />
            <FinanceSection type="outcome" finances={groupedFinances.outcome || []} />
          </div>
        </div>

        {state.finances.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No financial entries yet</p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Add Your First Entry
            </Button>
          </div>
        )}
      </div>
      <BottomNavigation />
      <NewFinanceModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
