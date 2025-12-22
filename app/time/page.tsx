'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth-guard';
import { Navigation } from '@/components/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { TimeRecordCard } from '@/components/time/time-record-card';
import { timeService } from '@/services/time-service';
import type { TimeRecord } from '@/types/time';
import { Plus, Clock, Timer, CalendarDays } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { CreateTimeRecordModal } from './modal/create-time-record-modal';
import { EditTimeRecordModal } from './modal/edit-time-record-modal';

function formatTotalTime(minutes: number): string {
  if (minutes === 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
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
            <Card className="text-center py-12">
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

                  return (
                    <div key={category} className="space-y-4">
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-foreground">{category}</div>
                            </div>
                            <div className="ml-auto text-right">
                              <div className="text-lg font-bold text-primary">
                                {formatTotalTime(categoryTotal)}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {categoryRecords.length}{' '}
                                {categoryRecords.length === 1
                                  ? 'entry'
                                  : 'entries'}
                              </span>
                            </div>
                          </CardTitle>
                        </CardHeader>
                      </Card>

                      <div className="space-y-4">
                        {categoryRecords.map((record) => (
                          <TimeRecordCard
                            key={record.id}
                            record={record}
                            onEdit={() => handleEditRecord(record)}
                            onDelete={() => handleDeleteRecord(record.id)}
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
