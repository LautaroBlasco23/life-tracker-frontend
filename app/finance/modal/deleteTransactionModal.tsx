'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/types';

interface DeleteTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onConfirmDelete: () => Promise<void>;
}

export function DeleteTransactionModal({
  open,
  onOpenChange,
  transaction,
  onConfirmDelete,
}: DeleteTransactionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Transaction</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              "{transaction.categoryName}"
            </span>
            ? This will permanently remove the transaction from your records.
          </p>
          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <div className="text-sm">
              <div className="font-medium text-foreground mb-1">
                {transaction.categoryName}
              </div>
              <div className="text-muted-foreground text-xs">
                {transaction.description && (
                  <div className="mb-1">{transaction.description}</div>
                )}
                <div>
                  {transaction.type} • {transaction.frequency} • $
                  {transaction.amount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
