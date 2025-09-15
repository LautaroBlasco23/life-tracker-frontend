"use client"

import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppContext } from "@/context/AppContext"
import { FINANCE_TYPES } from "@/constants"
import type { Finance } from "@/models"

interface NewFinanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FinanceFormData {
  title: string
  amount: number
  type: "income" | "outcome"
}

export function NewFinanceModal({ open, onOpenChange }: NewFinanceModalProps) {
  const { dispatch } = useAppContext()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FinanceFormData>({
    defaultValues: {
      title: "",
      amount: 0,
      type: "income",
    },
  })

  const onSubmit = (data: FinanceFormData) => {
    const newFinance: Finance = {
      id: Date.now().toString(),
      title: data.title,
      amount: data.amount,
      type: data.type,
      date: new Date(),
    }

    dispatch({ type: "ADD_FINANCE", payload: newFinance })
    reset()
    onOpenChange(false)
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Financial Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Enter transaction title"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
              })}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select onValueChange={(value) => setValue("type", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FINANCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "income" ? "Income" : "Expense"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Add Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
