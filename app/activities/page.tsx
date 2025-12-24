'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthGuard } from '@/components/auth-guard';
import { Navigation } from '@/components/navigation';
import { CreateActivityModal } from '@/components/activity/create-activity-modal';
import { EditActivityModal } from '@/components/activity/edit-activity-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { activityService } from '@/services/activity-service';
import type { Activity, DayTime, DayOfWeek } from '@/types/activity';
import { Plus, Sun, CloudSun, Moon, Filter, X, Undo2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { Badge } from '@/components/ui/badge';
import { ActivityFilter } from '@/types';
import { ActivityFilterModal } from './modal/filterModal';
import { CategoryHeader } from '@/components/ui/category/categoryHeader';
import { EntityCard } from '@/components/ui/card/entityCard';

const CATEGORY_CONFIG = {
  morning: {
    label: 'Morning',
    icon: Sun,
    description: 'Start your day right',
    accentColor: 'border-amber-400',
    iconColor: 'text-amber-500',
  },
  afternoon: {
    label: 'Afternoon',
    icon: CloudSun,
    description: 'Keep the momentum going',
    accentColor: 'border-sky-400',
    iconColor: 'text-sky-500',
  },
  evening: {
    label: 'Evening',
    icon: Moon,
    description: 'Wind down and reflect',
    accentColor: 'border-indigo-400',
    iconColor: 'text-indigo-500',
  },
} as const;

type ViewMode = 'today' | 'filtered';

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isToday(dateString?: string): boolean {
  if (!dateString) return true;
  const target = parseLocalDate(dateString);
  const today = new Date();
  return (
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate()
  );
}

function formatDateLabel(dateString?: string): string {
  if (!dateString || isToday(dateString)) return 'today';
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function toCompletionDateISO(dateString?: string): string | undefined {
  if (!dateString || isToday(dateString)) return undefined;
  const date = parseLocalDate(dateString);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function formatDayFrequency(dayFrequency?: string): string | null {
  if (!dayFrequency) return null;
  try {
    const days: DayOfWeek[] = JSON.parse(dayFrequency);
    return days
      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');
  } catch {
    return null;
  }
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>({});
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const targetDate =
    viewMode === 'filtered' ? activeFilter.scheduledFor : undefined;
  const dateLabel = formatDateLabel(targetDate);

  const loadActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const userActivities =
        viewMode === 'today'
          ? await activityService.getTodayActivities()
          : await activityService.getActivities(activeFilter);
      setActivities(userActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
      showToast({
        title: 'Failed to load activities',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, activeFilter]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleApplyFilter = (filter: ActivityFilter) => {
    const hasFilters = Object.keys(filter).length > 0;
    setActiveFilter(filter);
    setViewMode(hasFilters ? 'filtered' : 'today');
  };

  const handleClearFilters = () => {
    setActiveFilter({});
    setViewMode('today');
  };

  const getActiveFilterCount = (): number => {
    return Object.values(activeFilter).filter(Boolean).length;
  };

  const handleDeleteActivity = async (activityId: number) => {
    try {
      await activityService.deleteActivity(activityId);
      setActivities(
        activities.filter((activity) => activity.id !== activityId)
      );
      showToast({
        title: 'Activity deleted',
        description: 'The activity has been successfully deleted.',
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

  const handleActivityCreated = (newActivity: Activity) => {
    if (viewMode === 'today') {
      loadActivities();
    } else {
      setActivities([newActivity, ...activities]);
    }
    setShowCreateModal(false);
  };

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setActivities(
      activities.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
    setShowEditModal(false);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowEditModal(true);
  };

  const updateActivity = (updatedActivity: Activity) => {
    setActivities(
      activities.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
  };

  const handleRecordCompletion = async (activity: Activity) => {
    if (activity.isCompletedToday) {
      showToast({
        title: 'Activity Complete',
        description: `This activity is already completed for ${dateLabel}!`,
        variant: 'default',
      });
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(activity.id));

    const optimisticActivity: Activity = {
      ...activity,
      todayCompletions: activity.todayCompletions + 1,
      isCompletedToday:
        activity.todayCompletions + 1 >= activity.completionAmount,
    };
    updateActivity(optimisticActivity);

    try {
      const completionDate = toCompletionDateISO(targetDate);
      await activityService.recordActivity(activity.id, { completionDate });

      const isNowCompleted = optimisticActivity.isCompletedToday;
      showToast({
        title: isNowCompleted ? 'Activity Completed!' : 'Progress Updated',
        description: isNowCompleted
          ? `Great job! You've completed "${activity.title}" for ${dateLabel}.`
          : `Progress: ${optimisticActivity.todayCompletions}/${optimisticActivity.completionAmount}`,
        variant: 'default',
      });
    } catch (error) {
      updateActivity(activity);
      showToast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to record completion',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
    }
  };

  const handleRevertCompletion = async (activity: Activity) => {
    setProcessingIds((prev) => new Set(prev).add(activity.id));

    const newCompletions = Math.max(0, activity.todayCompletions - 1);
    const optimisticActivity: Activity = {
      ...activity,
      todayCompletions: newCompletions,
      isCompletedToday: newCompletions >= activity.completionAmount,
    };
    updateActivity(optimisticActivity);

    try {
      const revertDate = toCompletionDateISO(targetDate);
      await activityService.revertLastCompletion(activity.id, revertDate);

      showToast({
        title: 'Completion Reverted',
        description: `Removed one completion from "${activity.title}" for ${dateLabel}.`,
        variant: 'default',
      });
    } catch (error) {
      updateActivity(activity);
      showToast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to revert completion',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
    }
  };

  const activitiesByCategory = activities.reduce(
    (acc, activity) => {
      const dayTime = activity.dayTime;
      if (!acc[dayTime]) {
        acc[dayTime] = [];
      }
      acc[dayTime].push(activity);
      return acc;
    },
    {} as Record<DayTime, Activity[]>
  );

  const filterCount = getActiveFilterCount();

  const getPageTitle = (): string => {
    if (viewMode === 'today') return "Today's Activities";
    if (activeFilter.scheduledFor) {
      const date = parseLocalDate(activeFilter.scheduledFor);
      return `Activities for ${date.toLocaleDateString()}`;
    }
    return 'Filtered Activities';
  };

  const getPageDescription = (): string => {
    if (viewMode === 'today')
      return 'Track and complete your activities for today';
    const parts: string[] = [];
    if (activeFilter.frequency) parts.push(activeFilter.frequency);
    if (activeFilter.dayTime) parts.push(activeFilter.dayTime);
    return parts.length > 0 ? `Showing: ${parts.join(', ')}` : 'All activities';
  };

  const buildActivityBadges = (activity: Activity) => {
    const badges: Array<{ label: string; variant: 'outline' | 'default' }> = [
      { label: activity.frequency, variant: 'outline' },
    ];
    const formattedDays = formatDayFrequency(activity.dayFrequency);
    if (activity.frequency === 'weekly' && formattedDays) {
      badges.push({ label: formattedDays, variant: 'outline' });
    }
    return badges;
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading activities...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <Navigation />
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col gap-4 mb-8 md:hidden">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-muted-foreground">
                {getPageDescription()}
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
                New Activity
              </Button>
            </div>
          </div>

          {/* Desktop: Original side-by-side layout */}
          <div className="hidden md:flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                {getPageTitle()}
              </h1>
              <p className="text-muted-foreground">{getPageDescription()}</p>
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
                New Activity
              </Button>
            </div>
          </div>

          {viewMode === 'filtered' && filterCount > 0 && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeFilter.frequency && (
                  <Badge variant="secondary">{activeFilter.frequency}</Badge>
                )}
                {activeFilter.dayTime && (
                  <Badge variant="secondary">{activeFilter.dayTime}</Badge>
                )}
                {activeFilter.scheduledFor && (
                  <Badge variant="secondary">
                    {parseLocalDate(
                      activeFilter.scheduledFor
                    ).toLocaleDateString()}
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

          {activities.length === 0 ? (
            <Card className="text-center py-12 bg-muted/30">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {viewMode === 'today'
                      ? 'No activities for today'
                      : 'No activities match your filters'}
                  </h3>
                  <p>
                    {viewMode === 'today'
                      ? 'Create activities to see them appear here on their scheduled days.'
                      : 'Try adjusting your filters or create new activities.'}
                  </p>
                </div>
                {viewMode === 'filtered' ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create your first activity
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {(Object.keys(CATEGORY_CONFIG) as DayTime[]).map((dayTime) => {
                const categoryActivities = activitiesByCategory[dayTime] || [];
                const config = CATEGORY_CONFIG[dayTime];

                if (categoryActivities.length === 0) return null;

                return (
                  <div key={dayTime} className="space-y-4">
                    <CategoryHeader
                      icon={config.icon}
                      label={config.label}
                      description={config.description}
                      accentColor={config.accentColor}
                      iconColor={config.iconColor}
                      summaryValue={categoryActivities.length.toString()}
                      summaryLabel="Total"
                      itemCount={categoryActivities.length}
                      itemName="activity"
                    />
                    <div className="space-y-4">
                      {categoryActivities.map((activity) => (
                        <EntityCard
                          key={activity.id}
                          title={activity.title}
                          subtitle={activity.description}
                          badges={buildActivityBadges(activity)}
                          progress={{
                            current: activity.todayCompletions,
                            total: activity.completionAmount,
                            completedLabel: 'Complete',
                            incompleteHint: 'Tap to complete',
                          }}
                          isCompleted={activity.isCompletedToday}
                          onClick={() => handleRecordCompletion(activity)}
                          onEdit={() => handleEditActivity(activity)}
                          onDelete={() => handleDeleteActivity(activity.id)}
                          isProcessing={processingIds.has(activity.id)}
                          extraMenuItems={
                            activity.todayCompletions > 0
                              ? [
                                  {
                                    label: 'Revert Last',
                                    icon: Undo2,
                                    onClick: () =>
                                      handleRevertCompletion(activity),
                                    disabled: processingIds.has(activity.id),
                                  },
                                ]
                              : undefined
                          }
                          deleteModal={{
                            title: 'Delete Activity',
                            itemName: activity.title,
                            confirmLabel: 'Delete Activity',
                            itemDetails: (
                              <div className="text-sm">
                                <div className="font-medium text-foreground mb-1">
                                  {activity.title}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {activity.description && (
                                    <div className="mb-1">
                                      {activity.description}
                                    </div>
                                  )}
                                  <div>
                                    {activity.frequency} • {activity.dayTime} •
                                    Target: {activity.completionAmount}
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
              })}
            </div>
          )}

          <CreateActivityModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onActivityCreated={handleActivityCreated}
          />
          <EditActivityModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            activity={editingActivity}
            onActivityUpdated={handleActivityUpdated}
          />
          <ActivityFilterModal
            open={showFilterModal}
            onOpenChange={setShowFilterModal}
            currentFilter={activeFilter}
            onApplyFilter={handleApplyFilter}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
