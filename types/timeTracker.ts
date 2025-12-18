export interface TimeRecord {
  id: string;
  category: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeRecordInput {
  category: string;
  description: string;
  durationMinutes: number;
}

export interface UpdateTimeRecordInput {
  category?: string;
  description?: string;
  durationMinutes?: number;
}

export const TIME_CATEGORIES = [
  'Reading',
  'Gaming',
  'Exercise',
  'Work',
  'Study',
  'Meditation',
  'Hobbies',
  'Social',
  'Entertainment',
  'Other',
] as const;

export type TimeCategory = (typeof TIME_CATEGORIES)[number];
