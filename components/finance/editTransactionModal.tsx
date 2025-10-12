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
import { financeService } from '@/services/financeService';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, TransactionType, Category } from '@/types';

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
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (transaction && open) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setCategoryId(transaction.categoryId);
      setSubcategoryId(transaction.subcategoryId);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
    }
  }, [transaction, open]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('outcome');
    setCategoryId(null);
    setSubcategoryId(null);
    setDate('');
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (categoryId) {
      const currentCategory = categories.find((cat) => cat.id === categoryId);
      if (currentCategory?.type !== newType) {
        setCategoryId(null);
        setSubcategoryId(null);
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(Number(value));
    setSubcategoryId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: 'Validation error',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (!categoryId || !subcategoryId) {
      toast({
        title: 'Validation error',
        description: 'Please select a category and subcategory.',
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
          amount: amountValue,
          categoryId,
          subcategoryId,
          description,
          date: new Date(date).toISOString(),
        }
      );

      onTransactionUpdated(updatedTransaction);
      toast({
        title: 'Transaction updated',
        description: 'Your transaction has been successfully updated.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
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

  const filteredCategories = categories.filter((cat) => cat.type === type);
  const selectedCategory = categoryId
    ? categories.find((cat) => cat.id === categoryId)
    : null;
  const subcategories = selectedCategory?.subcategories || [];

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
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={categoryId?.toString() || ''}
              onValueChange={handleCategoryChange}
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

          {categoryId && subcategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory">Subcategory</Label>
              <Select
                value={subcategoryId?.toString() || ''}
                onValueChange={(value) => setSubcategoryId(Number(value))}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcat) => (
                    <SelectItem key={subcat.id} value={subcat.id.toString()}>
                      {subcat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
