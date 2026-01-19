'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { financeService } from '@/services/finance-service';
import { showToast } from '@/lib/toast';
import type {
  Transaction,
  TransactionType,
  TransactionFrequency,
  Category,
} from '@/types';
import { formatInputValue, parseInputValue } from '@/utils/formatNumbers';

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onTransactionUpdated: (transaction: Transaction) => void;
  categories: Category[];
}

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
  onTransactionUpdated,
  categories,
}: EditTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('outcome');
  const [frequency, setFrequency] = useState<TransactionFrequency>('variable');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction && open) {
      setDescription(transaction.description || '');
      setAmount(formatInputValue(Math.floor(transaction.amount).toString()));
      setType(transaction.type);
      setFrequency(transaction.frequency);
      setCategoryId(transaction.categoryId);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
    }
  }, [transaction, open]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('outcome');
    setFrequency('variable');
    setCategoryId(null);
    setDate('');
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (categoryId) {
      const currentCategory = categories.find((cat) => cat.id === categoryId);
      if (currentCategory?.type !== newType) {
        setCategoryId(null);
      }
    }
  };

  const handleFrequencyChange = (newFrequency: TransactionFrequency) => {
    setFrequency(newFrequency);
    if (categoryId) {
      const currentCategory = categories.find((cat) => cat.id === categoryId);
      if (currentCategory?.applicableToFreq !== newFrequency) {
        setCategoryId(null);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value);
    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const numericAmount = parseInputValue(amount);
    const amountValue = parseFloat(numericAmount);

    if (isNaN(amountValue) || amountValue <= 0) {
      showToast({
        title: 'Validation error',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (!categoryId) {
      showToast({
        title: 'Validation error',
        description: 'Please select a category.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const updatedTransaction = await financeService.updateTransaction(
        transaction.id,
        {
          type,
          frequency,
          amount: amountValue,
          categoryId,
          description,
          date: new Date(date).toISOString(),
        }
      );

      onTransactionUpdated(updatedTransaction);
      showToast({
        title: 'Transaction updated',
        description: 'Your transaction has been successfully updated.',
      });
      onOpenChange(false);
    } catch (error) {
      showToast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!transaction) return null;

  const filteredCategories = categories.filter(
    (cat) => cat.type === type && cat.applicableToFreq === frequency
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update your transaction details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Describe your transaction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Type</Label>
            <Select
              value={type}
              onValueChange={(value: TransactionType) =>
                handleTypeChange(value)
              }
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="outcome">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(value: TransactionFrequency) =>
                handleFrequencyChange(value)
              }
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={categoryId?.toString() || ''}
              onValueChange={(value) => setCategoryId(Number(value))}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
