'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ActivityFilter } from '@/types';

interface ActivityFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilter: ActivityFilter;
  onApplyFilter: (filter: ActivityFilter) => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'all', label: 'All frequencies' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'oneTime', label: 'One-time' },
] as const;

const DAY_TIME_OPTIONS = [
  { value: 'all', label: 'All times' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
] as const;

export function ActivityFilterModal({
  open,
  onOpenChange,
  currentFilter,
  onApplyFilter,
}: ActivityFilterModalProps) {
  const [filter, setFilter] = useState<ActivityFilter>(currentFilter);

  const handleApply = () => {
    const cleanedFilter: ActivityFilter = {};

    if (filter.frequency) cleanedFilter.frequency = filter.frequency;
    if (filter.dayTime) cleanedFilter.dayTime = filter.dayTime;
    if (filter.scheduledFor) cleanedFilter.scheduledFor = filter.scheduledFor;

    onApplyFilter(cleanedFilter);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilter({});
  };

  const hasActiveFilters =
    filter.frequency || filter.dayTime || filter.scheduledFor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Activities</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={filter.frequency ?? 'all'}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  frequency: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="All frequencies" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayTime">Time of Day</Label>
            <Select
              value={filter.dayTime ?? 'all'}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  dayTime: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger id="dayTime">
                <SelectValue placeholder="All times" />
              </SelectTrigger>
              <SelectContent>
                {DAY_TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Scheduled For Date</Label>
            <Input
              id="scheduledFor"
              type="date"
              value={filter.scheduledFor ?? ''}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  scheduledFor: e.target.value || undefined,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Show activities scheduled for a specific date
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleReset} className="mr-auto">
              Reset
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
