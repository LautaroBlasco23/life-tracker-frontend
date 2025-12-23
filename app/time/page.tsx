'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth-guard';
import { Navigation } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { timeService } from '@/services/time-service';
import type { TimeRecord } from '@/types/time';
import { Plus, Clock, Timer, CalendarDays } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { CreateTimeRecordModal } from './modal/create-time-record-modal';
import { EditTimeRecordModal } from './modal/edit-time-record-modal';
import { CategoryHeader } from '@/components/ui/category/categoryHeader';
import { EntityCard } from '@/components/ui/card/entityCard';

const CATEGORY_COLORS: Record<
  string,
  { accentColor: string; iconColor: string }
> = {
  Work: { accentColor: 'border-violet-400', iconColor: 'text-violet-500' },
  Personal: {
    accentColor: 'border-emerald-400',
    iconColor: 'text-emerald-500',
  },
  Health: { accentColor: 'border-rose-400', iconColor: 'text-rose-500' },
  Learning: { accentColor: 'border-amber-400', iconColor: 'text-amber-500' },
  default: { accentColor: 'border-sky-400', iconColor: 'text-sky-500' },
};

function formatTotalTime(minutes: number): string {
  if (minutes === 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

function formatRecordDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TimePage() {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await timeService.getRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
      showToast({
        title: 'Failed to load records',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDeleteRecord = async (recordId: number) => {
    try {
      await timeService.deleteRecord(recordId);
      setRecords(records.filter((r) => r.id !== recordId));
      showToast({
        title: 'Record deleted',
        description: 'The time entry has been deleted.',
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

  const handleRecordCreated = (newRecord: TimeRecord) => {
    setRecords([newRecord, ...records]);
    setShowCreateModal(false);
  };

  const handleRecordUpdated = (updatedRecord: TimeRecord) => {
    setRecords(
      records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    setShowEditModal(false);
    setEditingRecord(null);
  };

  const handleEditRecord = (record: TimeRecord) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const stats = useMemo(() => {
    const totalMinutes = records.reduce((sum, r) => sum + r.durationMinutes, 0);
    const categoryTotals = records.reduce(
      (acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.durationMinutes;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategory = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      totalMinutes,
      recordCount: records.length,
      topCategory: topCategory ? topCategory[0] : null,
      topCategoryMinutes: topCategory ? topCategory[1] : 0,
    };
  }, [records]);

  const recordsByCategory = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        if (!acc[record.category]) {
          acc[record.category] = [];
        }
        acc[record.category].push(record);
        return acc;
      },
      {} as Record<string, TimeRecord[]>
    );
  }, [records]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading time records...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Time Tracking
              </h1>
              <p className="text-muted-foreground">
                Log and review how you spend your time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Log Time
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Time
                    </p>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                      {formatTotalTime(stats.totalMinutes)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/30">
                    <Clock className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Entries
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.recordCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CalendarDays className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Top Category
                    </p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.topCategory ?? 'N/A'}
                    </p>
                    {stats.topCategory && (
                      <p className="text-xs text-muted-foreground">
                        {formatTotalTime(stats.topCategoryMinutes)}
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Timer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {records.length === 0 ? (
            <Card className="text-center py-12 bg-muted/30">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No time entries yet
                  </h3>
                  <p>Start logging your time to see your records here.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  Log your first entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(recordsByCategory).map(
                ([category, categoryRecords]) => {
                  const categoryTotal = categoryRecords.reduce(
                    (sum, r) => sum + r.durationMinutes,
                    0
                  );
                  const colors =
                    CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default;

                  return (
                    <div key={category} className="space-y-4">
                      <CategoryHeader
                        icon={Clock}
                        label={category}
                        accentColor={colors.accentColor}
                        iconColor={colors.iconColor}
                        summaryValue={formatTotalTime(categoryTotal)}
                        summaryLabel="Total"
                        itemCount={categoryRecords.length}
                        itemName="entry"
                      />

                      <div className="space-y-4">
                        {categoryRecords.map((record) => (
                          <EntityCard
                            key={record.id}
                            title={record.description}
                            badges={[
                              { label: record.category, variant: 'default' },
                            ]}
                            metadata={
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {formatDuration(record.durationMinutes)}
                                </span>
                                <span>•</span>
                                <span>
                                  {formatRecordDate(record.createdAt)}
                                </span>
                              </div>
                            }
                            onEdit={() => handleEditRecord(record)}
                            onDelete={() => handleDeleteRecord(record.id)}
                            deleteModal={{
                              title: 'Delete Time Entry',
                              itemName: record.description,
                              confirmLabel: 'Delete Entry',
                              itemDetails: (
                                <div className="text-sm">
                                  <div className="font-medium text-foreground mb-1">
                                    {record.description}
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    <div>
                                      {record.category} •{' '}
                                      {formatDuration(record.durationMinutes)}
                                    </div>
                                    <div className="mt-1">
                                      {formatRecordDate(record.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              ),
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          <CreateTimeRecordModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onRecordCreated={handleRecordCreated}
          />

          <EditTimeRecordModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            record={editingRecord}
            onRecordUpdated={handleRecordUpdated}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
