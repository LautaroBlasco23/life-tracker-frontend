'use client';

import { useState } from 'react';
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
import type {
  Transaction,
  TransactionType,
  TransactionFrequency,
  PaymentFrequency,
  Category,
} from '@/types';
import { financeService } from '@/services/finance-service';
import { showToast } from '@/lib/toast';
import { formatInputValue, parseInputValue } from '@/utils/formatNumbers';

interface CreateTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionCreated: (transaction: Transaction) => void;
  categories: Category[];
  defaultFrequency: TransactionFrequency;
}

export function CreateTransactionModal({
  open,
  onOpenChange,
  onTransactionCreated,
  categories,
  defaultFrequency,
}: CreateTransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('outcome');
  const [frequency, setFrequency] =
    useState<TransactionFrequency>(defaultFrequency);
  const [paymentFrequency, setPaymentFrequency] =
    useState<PaymentFrequency>('monthly');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const isFixed = frequency === 'fixed';

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('outcome');
    setFrequency(defaultFrequency);
    setPaymentFrequency('monthly');
    setCategoryId(null);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategoryId(null);
  };

  const handleFrequencyChange = (newFrequency: TransactionFrequency) => {
    setFrequency(newFrequency);
    setCategoryId(null);
    if (newFrequency === 'fixed') {
      setAmount('');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value);
    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      showToast({
        title: 'Validation error',
        description: 'Please select a category.',
        variant: 'destructive',
      });
      return;
    }

    let amountValue = 0;
    if (!isFixed) {
      const numericAmount = parseInputValue(amount);
      amountValue = parseFloat(numericAmount);

      if (isNaN(amountValue) || amountValue <= 0) {
        showToast({
          title: 'Validation error',
          description: 'Please enter a valid amount greater than 0.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const newTransaction = await financeService.createTransaction({
        type,
        frequency,
        paymentFrequency: isFixed ? paymentFrequency : undefined,
        amount: amountValue,
        categoryId,
        description,
        date: new Date(date).toISOString(),
      });

      onTransactionCreated(newTransaction);
      resetForm();
      showToast({
        title: 'Transaction created',
        description: isFixed
          ? 'Your fixed transaction has been created. You can now add payments to it.'
          : 'Your transaction has been successfully created.',
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      showToast({
        title: 'Creation failed',
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

  const filteredCategories = categories.filter(
    (cat) => cat.type === type && cat.applicableToFreq === frequency
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isFixed ? 'Create Fixed Transaction' : 'Create New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {isFixed
              ? 'Create a recurring transaction. You can add payments to it later.'
              : 'Add a new transaction to track your finances.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your transaction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
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
            <Label htmlFor="frequency">Frequency</Label>
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
                <SelectItem value="fixed">Fixed (Recurring)</SelectItem>
                <SelectItem value="variable">Variable (One-time)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isFixed && (
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select
                value={paymentFrequency}
                onValueChange={(value: PaymentFrequency) =>
                  setPaymentFrequency(value)
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="bimonthly">Bimonthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How often you need to make payments for this transaction
              </p>
            </div>
          )}

          {!isFixed && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
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
              {isLoading
                ? 'Creating...'
                : isFixed
                  ? 'Create Fixed Transaction'
                  : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
