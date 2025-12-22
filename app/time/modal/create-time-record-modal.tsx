'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { timeService } from '@/services/time-service';
import { showToast } from '@/lib/toast';
import { TIME_CATEGORIES, TimeRecord } from '@/types/time';

interface CreateTimeRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordCreated: (record: TimeRecord) => void;
}

export function CreateTimeRecordModal({
  open,
  onOpenChange,
  onRecordCreated,
}: CreateTimeRecordModalProps) {
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCategory('');
    setDescription('');
    setHours('');
    setMinutes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalMinutes =
      (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);

    if (totalMinutes <= 0) {
      showToast({
        title: 'Invalid duration',
        description: 'Please enter a valid duration.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newRecord = await timeService.createRecord({
        category,
        description,
        durationMinutes: totalMinutes,
      });
      onRecordCreated(newRecord);
      resetForm();
      showToast({
        title: 'Time recorded',
        description: 'Your time entry has been saved.',
      });
    } catch (error) {
      showToast({
        title: 'Failed to save',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TIME_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What did you do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Hours
                </span>
              </div>
              <span className="text-muted-foreground">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Minutes
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !category}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
