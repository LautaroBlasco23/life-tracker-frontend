'use client';

import type React from 'react';

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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { activityService } from '@/services/activity-service';
import type { Activity, Frequency, DayOfWeek, DayTime } from '@/types/activity';
import { showToast } from '@/lib/toast';

interface CreateActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityCreated: (activity: Activity) => void;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const DAY_TIMES: { value: DayTime; label: string }[] = [
  { value: 'notSpecified', label: 'Any Moment' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

export function CreateActivityModal({
  open,
  onOpenChange,
  onActivityCreated,
}: CreateActivityModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completionAmount, setCompletionAmount] = useState(1);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [dayTime, setDayTime] = useState<DayTime>('notSpecified');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCompletionAmount(1);
    setFrequency('daily');
    setDayTime('morning');
    setSelectedDays([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (frequency === 'weekly' && selectedDays.length === 0) {
      showToast({
        title: 'Validation error',
        description: 'Please select at least one day for weekly activities.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Updated to use the new service method signature
      const newActivity = await activityService.createActivity({
        title,
        description,
        completionAmount,
        frequency,
        dayTime, // Changed from category to dayTime
        dayFrequency: frequency === 'weekly' ? selectedDays : undefined,
      });

      onActivityCreated(newActivity);
      resetForm();
      showToast({
        title: 'Activity created',
        description: 'Your new activity has been successfully created.',
      });
    } catch (error) {
      console.error('Create activity error:', error);
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

  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    if (checked) {
      setSelectedDays([...selectedDays, day]);
    } else {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
          <DialogDescription>
            Add a new activity to track your progress and build better habits.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Morning Workout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your activity (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input border-border resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="completionAmount">Target Amount</Label>
              <Input
                id="completionAmount"
                type="number"
                min="1"
                value={completionAmount}
                onChange={(e) => setCompletionAmount(Number(e.target.value))}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayTime">Time of Day</Label>
              <Select
                value={dayTime}
                onValueChange={(value: DayTime) => setDayTime(value)}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_TIMES.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(value: Frequency) => setFrequency(value)}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="oneTime">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Days of the week</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={(checked) =>
                        handleDayToggle(day.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={day.value} className="text-sm font-normal">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
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
              {isLoading ? 'Creating...' : 'Create Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
