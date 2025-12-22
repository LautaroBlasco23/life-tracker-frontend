'use client';

import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, Trash2, Edit, Undo2 } from 'lucide-react';
import { activityService } from '@/services/activity-service';
import { DeleteActivityModal } from '@/components/activity/delete-activity-modal';
import type { Activity, DayOfWeek } from '@/types/activity';
import { showToast } from '@/lib/toast';

interface ActivityCardProps {
  activity: Activity;
  onDelete: () => void;
  onEdit: () => void;
  onProgressUpdate: (updatedActivity: Activity) => void;
  targetDate?: string; // ISO date string (YYYY-MM-DD), undefined means today
}

const CustomDropdown = ({
  children,
  trigger,
  align = 'end',
}: {
  children: React.ReactNode;
  trigger: React.ReactNode;
  align?: 'start' | 'end';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

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
          className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${
            align === 'end' ? 'right-0' : 'left-0'
          }`}
          style={{ top: '100%', marginTop: '4px' }}
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({
  children,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${
        disabled
          ? 'pointer-events-none opacity-50'
          : variant === 'destructive'
            ? 'text-red-600 focus:bg-red-50 focus:text-red-600 hover:bg-red-50'
            : 'focus:bg-accent focus:text-accent-foreground hover:bg-accent'
      }`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

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

export function ActivityCard({
  activity,
  onDelete,
  onEdit,
  onProgressUpdate,
  targetDate,
}: ActivityCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isTargetToday = isToday(targetDate);
  const dateLabel = formatDateLabel(targetDate);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete();
  };

  const handleRevertCompletion = async () => {
    setIsReverting(true);

    const newCompletions = Math.max(0, activity.todayCompletions - 1);
    const optimisticActivity: Activity = {
      ...activity,
      todayCompletions: newCompletions,
      isCompletedToday: newCompletions >= activity.completionAmount,
    };
    onProgressUpdate(optimisticActivity);

    try {
      const revertDate = toCompletionDateISO(targetDate);
      await activityService.revertLastCompletion(activity.id, revertDate);

      showToast({
        title: 'Completion Reverted',
        description: `Removed one completion from "${activity.title}" for ${dateLabel}.`,
        variant: 'default',
      });
    } catch (error) {
      onProgressUpdate(activity);

      showToast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to revert completion',
        variant: 'destructive',
      });
    } finally {
      setIsReverting(false);
    }
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isDropdownElement =
      target.closest('[data-dropdown]') ||
      target.closest('button') ||
      target.tagName === 'BUTTON';

    if (isDropdownElement) {
      return;
    }

    if (activity.isCompletedToday) {
      showToast({
        title: 'Activity Complete',
        description: `This activity is already completed for ${dateLabel}!`,
        variant: 'default',
      });
      return;
    }

    await handleRecordCompletion();
  };

  const handleRecordCompletion = async () => {
    setIsRecording(true);

    const optimisticActivity: Activity = {
      ...activity,
      todayCompletions: activity.todayCompletions + 1,
      isCompletedToday:
        activity.todayCompletions + 1 >= activity.completionAmount,
    };
    onProgressUpdate(optimisticActivity);

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
      onProgressUpdate(activity);

      showToast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to record completion',
        variant: 'destructive',
      });
    } finally {
      setIsRecording(false);
    }
  };

  const formatDayFrequency = (dayFrequency?: string) => {
    if (!dayFrequency) return null;
    try {
      const days: DayOfWeek[] = JSON.parse(dayFrequency);
      return days
        .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
        .join(', ');
    } catch {
      return null;
    }
  };

  const progressPercentage =
    (activity.todayCompletions / activity.completionAmount) * 100;
  const isCompleted = activity.isCompletedToday;

  return (
    <>
      <Card
        className={`bg-muted/30 transition-all duration-200 ${
          isCompleted
            ? 'border-green-500/50 bg-green-500/10'
            : 'hover:shadow-md cursor-pointer hover:scale-[1.02] hover:bg-muted/50'
        } ${isRecording || isReverting ? 'opacity-70' : ''}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle
                  className={`text-lg font-medium ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}
                >
                  {activity.title}
                </CardTitle>
                {isCompleted && (
                  <Badge
                    variant="default"
                    className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50"
                  >
                    Complete
                  </Badge>
                )}
              </div>
              {activity.description && (
                <CardDescription className="mt-1 text-muted-foreground">
                  {activity.description}
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
                {activity.todayCompletions > 0 && (
                  <DropdownMenuItem
                    onClick={handleRevertCompletion}
                    disabled={isReverting}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    {isReverting ? 'Reverting...' : 'Revert Last'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </CustomDropdown>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {activity.todayCompletions}/{activity.completionAmount}
              </span>
              {!isCompleted && (
                <span className="text-xs text-muted-foreground">
                  Tap to complete
                </span>
              )}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Badge variant="outline">{activity.frequency}</Badge>
            {activity.frequency === 'weekly' &&
              formatDayFrequency(activity.dayFrequency) && (
                <Badge variant="outline" className="text-xs">
                  {formatDayFrequency(activity.dayFrequency)}
                </Badge>
              )}
          </div>
        </CardContent>
      </Card>
      <DeleteActivityModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        activity={activity}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
