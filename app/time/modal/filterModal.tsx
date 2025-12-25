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
import { TIME_CATEGORIES } from '@/types/time';

export interface TimeRecordFilter {
  month?: number;
  year?: number;
  category?: string;
}

interface TimeFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilter: TimeRecordFilter;
  onApplyFilter: (filter: TimeRecordFilter) => void;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const YEARS = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i
);

export function TimeFilterModal({
  open,
  onOpenChange,
  currentFilter,
  onApplyFilter,
}: TimeFilterModalProps) {
  const [filter, setFilter] = useState<TimeRecordFilter>(currentFilter);

  const handleApply = () => {
    const cleanedFilter: TimeRecordFilter = {};

    if (filter.month !== undefined) cleanedFilter.month = filter.month;
    if (filter.year !== undefined) cleanedFilter.year = filter.year;
    if (filter.category !== undefined) cleanedFilter.category = filter.category;

    onApplyFilter(cleanedFilter);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilter({});
  };

  const hasActiveFilters =
    filter.month !== undefined ||
    filter.year !== undefined ||
    filter.category !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Time Records</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select
              value={filter.month?.toString() ?? 'all'}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  month: value === 'all' ? undefined : parseInt(value),
                }))
              }
            >
              <SelectTrigger id="month">
                <SelectValue placeholder="All months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select
              value={filter.year?.toString() ?? 'all'}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  year: value === 'all' ? undefined : parseInt(value),
                }))
              }
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={filter.category ?? 'all'}
              onValueChange={(value) =>
                setFilter((prev) => ({
                  ...prev,
                  category: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {TIME_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
