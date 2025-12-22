import {
  CreateTimeRecordInput,
  TimeRecord,
  UpdateTimeRecordInput,
} from '@/types/time';

let mockRecords: TimeRecord[] = [
  {
    id: '1',
    category: 'Reading',
    description: 'Finished chapter 5 of "Clean Code"',
    durationMinutes: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    category: 'Gaming',
    description: 'Played Elden Ring',
    durationMinutes: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    category: 'Exercise',
    description: 'Morning run in the park',
    durationMinutes: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const timeService = {
  async getRecords(): Promise<TimeRecord[]> {
    return [...mockRecords];
  },

  async createRecord(input: CreateTimeRecordInput): Promise<TimeRecord> {
    const now = new Date().toISOString();
    const newRecord: TimeRecord = {
      id: generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    mockRecords = [newRecord, ...mockRecords];
    return newRecord;
  },

  async updateRecord(
    id: string,
    input: UpdateTimeRecordInput
  ): Promise<TimeRecord> {
    const index = mockRecords.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }
    const updated: TimeRecord = {
      ...mockRecords[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    mockRecords[index] = updated;
    return updated;
  },

  async deleteRecord(id: string): Promise<void> {
    const index = mockRecords.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Record not found');
    }
    mockRecords = mockRecords.filter((r) => r.id !== id);
  },
};
