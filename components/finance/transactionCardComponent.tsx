"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Trash2, Edit, Calendar, DollarSign } from "lucide-react"
import type { Transaction } from "@/types/finance"
import { DeleteTransactionModal } from "./deleteTransactionModal"
import React from "react"

interface TransactionCardProps {
  transaction: Transaction
  onDelete: () => void
  onEdit: () => void
}

const CustomDropdown = ({ children, trigger, align = "end" }: {
  children: React.ReactNode
  trigger: React.ReactNode
  align?: "start" | "end"
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${align === 'end' ? 'right-0' : 'left-0'}`}
          style={{ top: '100%', marginTop: '4px' }}
        >
          <div onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

const DropdownMenuItem = ({
  children,
  onClick,
  variant = "default",
  disabled = false
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${disabled
        ? 'pointer-events-none opacity-50'
        : variant === 'destructive'
          ? 'text-red-600 focus:bg-red-50 focus:text-red-600 hover:bg-red-50'
          : 'focus:bg-accent focus:text-accent-foreground hover:bg-accent'
        }`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

export function TransactionCard({ transaction, onDelete, onEdit }: TransactionCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    await onDelete()
  }

  const getTypeBadgeVariant = (type: string) => {
    return type === "income" ? "default" : "destructive"
  }

  const getCategoryLabel = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isIncome = transaction.type === "income"

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-medium text-foreground">
                  {transaction.title}
                </CardTitle>
                <Badge variant={getTypeBadgeVariant(transaction.type)}>
                  {transaction.type}
                </Badge>
              </div>
              {transaction.description && (
                <CardDescription className="mt-1 text-muted-foreground">
                  {transaction.description}
                </CardDescription>
              )}
            </div>

            <div data-dropdown>
              <CustomDropdown
                trigger={
                  <>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </>
                }
                align="end"
              >
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </CustomDropdown>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(transaction.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className={`font-semibold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getCategoryLabel(transaction.category)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      <DeleteTransactionModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        transaction={transaction}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}
