'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth-guard';
import { Navigation } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import type {
  Transaction,
  TransactionType,
  TransactionFrequency,
  Category,
} from '@/types';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Filter,
  X,
} from 'lucide-react';
import { financeService } from '@/services/finance-service';
import { showToast } from '@/lib/toast';
import { CategoryHeader } from '@/components/ui/category/categoryHeader';
import { EntityCard } from '@/components/ui/card/entityCard';
import { formatCurrency } from '@/utils/formatNumbers';
import { Badge } from '@/components/ui/badge';
import { CreateTransactionModal } from './modal/createTransactionModal';
import { EditTransactionModal } from './modal/editTransactionModal';
import {
  createCategoryOptions,
  GenericFilterModal,
  MONTHS,
  YEARS,
} from '@/components/ui/filterModal/filterModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TransactionFilter
  extends Record<string, string | number | undefined> {
  month?: number;
  year?: number;
  categoryId?: number;
}

const TYPE_CONFIG = {
  income: {
    label: 'Income',
    icon: TrendingUp,
    description: 'Money coming in',
    accentColor: 'border-green-400',
    iconColor: 'text-green-500',
  },
  outcome: {
    label: 'Expenses',
    icon: TrendingDown,
    description: 'Money going out',
    accentColor: 'border-red-400',
    iconColor: 'text-red-500',
  },
} as const;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>({});
  const [activeFrequency, setActiveFrequency] =
    useState<TransactionFrequency>('variable');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userTransactions, allCategories] = await Promise.all([
        financeService.getTransactions({
          frequency: activeFrequency,
          month: activeFilter.month,
          year: activeFilter.year,
          categoryId: activeFilter.categoryId,
        }),
        financeService.getCategories(), // Remove frequency filter - fetch ALL categories
      ]);
      setTransactions(userTransactions);
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast({
        title: 'Failed to load data',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, activeFrequency]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilter = (filter: TransactionFilter) => {
    setActiveFilter(filter);
  };

  const handleClearFilters = () => {
    setActiveFilter({});
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (activeFilter.month !== undefined || activeFilter.year !== undefined)
      count++;
    if (activeFilter.categoryId !== undefined) count++;
    return count;
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await financeService.deleteTransaction(transactionId);
      setTransactions(
        transactions.filter((transaction) => transaction.id !== transactionId)
      );
      showToast({
        title: 'Transaction deleted',
        description: 'The transaction has been successfully deleted.',
      });
    } catch (error) {
      showToast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleTransactionCreated = (newTransaction: Transaction) => {
    loadData();
    setShowCreateModal(false);
  };

  const handleTransactionUpdated = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const transactionsByType = transactions.reduce(
    (acc, transaction) => {
      const type = transaction.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(transaction);
      return acc;
    },
    {} as Record<TransactionType, Transaction[]>
  );

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutcome = transactions
    .filter((t) => t.type === 'outcome')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalOutcome;
  const filterCount = getActiveFilterCount();

  const getFilterBadgeText = (): string | null => {
    if (activeFilter.month !== undefined && activeFilter.year !== undefined) {
      return `${MONTH_NAMES[activeFilter.month - 1]} ${activeFilter.year}`;
    }
    if (activeFilter.month !== undefined) {
      return MONTH_NAMES[activeFilter.month - 1];
    }
    if (activeFilter.year !== undefined) {
      return activeFilter.year.toString();
    }
    return null;
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading transactions...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <Navigation />
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex flex-col gap-4 mb-8 md:hidden">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Finance
              </h1>
              <p className="text-sm text-muted-foreground">
                Track your income and expenses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {filterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {filterCount}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Transaction
              </Button>
            </div>
          </div>

          <div className="hidden md:flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Finance
              </h1>
              <p className="text-muted-foreground">
                Track your income and expenses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {filterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {filterCount}
                  </Badge>
                )}
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Transaction
              </Button>
            </div>
          </div>

          <Tabs
            value={activeFrequency}
            onValueChange={(value) =>
              setActiveFrequency(value as TransactionFrequency)
            }
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fixed">Fixed</TabsTrigger>
              <TabsTrigger value="variable">Variable</TabsTrigger>
            </TabsList>
          </Tabs>

          {filterCount > 0 && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {getFilterBadgeText() && (
                  <Badge variant="secondary">{getFilterBadgeText()}</Badge>
                )}
                {activeFilter.categoryId !== undefined && (
                  <Badge variant="secondary">
                    {
                      categories.find((c) => c.id === activeFilter.categoryId)
                        ?.name
                    }
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-surface border-secondary/30 shadow-[inset_0_0_20px_rgba(97,218,251,0.05)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Income</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      ${formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-secondary/10">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-secondary/30 shadow-[inset_0_0_20px_rgba(97,218,251,0.05)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Expenses
                    </p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      ${formatCurrency(totalOutcome)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-secondary/10">
                    <TrendingDown className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-secondary/30 shadow-[inset_0_0_20px_rgba(97,218,251,0.05)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Balance
                    </p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      ${formatCurrency(balance)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Wallet className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {transactions.length === 0 ? (
            <Card className="text-center py-12 bg-muted/30">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {filterCount > 0
                      ? 'No transactions match your filters'
                      : 'No transactions yet'}
                  </h3>
                  <p>
                    {filterCount > 0
                      ? 'Try adjusting your filters or create new transactions.'
                      : 'Get started by creating your first transaction.'}
                  </p>
                </div>
                {filterCount > 0 ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create your first transaction
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {(Object.keys(TYPE_CONFIG) as TransactionType[]).map((type) => {
                const typeTransactions = transactionsByType[type] || [];
                const config = TYPE_CONFIG[type];

                if (typeTransactions.length === 0) return null;

                const typeTotal = typeTransactions.reduce(
                  (sum, t) => sum + t.amount,
                  0
                );

                return (
                  <div key={type} className="space-y-4">
                    <CategoryHeader
                      icon={config.icon}
                      label={config.label}
                      description={config.description}
                      accentColor={config.accentColor}
                      iconColor={config.iconColor}
                      summaryValue={`$${formatCurrency(typeTotal)}`}
                      summaryLabel="Total"
                      itemCount={typeTransactions.length}
                      itemName="transaction"
                    />

                    <div className="space-y-4">
                      {typeTransactions.map((transaction) => {
                        const isIncome = transaction.type === 'income';
                        return (
                          <EntityCard
                            key={transaction.id}
                            title={transaction.categoryName}
                            subtitle={transaction.description}
                            badges={[
                              {
                                label: transaction.type,
                                variant: isIncome ? 'default' : 'destructive',
                              },
                              {
                                label: transaction.frequency,
                                variant: 'outline',
                              },
                            ]}
                            metadata={
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-4 w-4 shrink-0" />
                                  <span className="truncate">
                                    {formatDate(transaction.date)}
                                  </span>
                                </div>
                                <span
                                  className={`font-semibold text-base sm:text-sm ${
                                    isIncome
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {isIncome ? '+' : '-'}$
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                            }
                            onEdit={() => handleEditTransaction(transaction)}
                            onDelete={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            deleteModal={{
                              title: 'Delete Transaction',
                              itemName: transaction.categoryName,
                              confirmLabel: 'Delete Transaction',
                              itemDetails: (
                                <div className="text-sm">
                                  <div className="font-medium text-foreground mb-1">
                                    {transaction.categoryName}
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    {transaction.description && (
                                      <div className="mb-1">
                                        {transaction.description}
                                      </div>
                                    )}
                                    <div>
                                      {transaction.type} •{' '}
                                      {transaction.frequency} • $
                                      {formatCurrency(transaction.amount)}
                                    </div>
                                  </div>
                                </div>
                              ),
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <CreateTransactionModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onTransactionCreated={handleTransactionCreated}
            categories={categories}
            defaultFrequency={activeFrequency}
          />

          <EditTransactionModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            transaction={editingTransaction}
            onTransactionUpdated={handleTransactionUpdated}
            categories={categories}
          />

          <GenericFilterModal
            open={showFilterModal}
            onOpenChange={setShowFilterModal}
            currentFilter={activeFilter}
            onApplyFilter={handleApplyFilter}
            title="Filter Transactions"
            fields={[
              {
                id: 'month',
                label: 'Month',
                type: 'select',
                options: MONTHS,
                placeholder: 'All months',
              },
              {
                id: 'year',
                label: 'Year',
                type: 'select',
                options: YEARS.map((y) => ({ value: y, label: String(y) })),
                placeholder: 'All years',
              },
              {
                id: 'categoryId',
                label: 'Category',
                type: 'select',
                options: createCategoryOptions(categories),
                placeholder: 'All categories',
              },
            ]}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
