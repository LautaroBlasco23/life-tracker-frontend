import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';

const MOCK_NOTES: Note[] = [
  {
    id: 1,
    title: 'Meeting Notes',
    content:
      'Discussed project timeline and milestones. Key decisions:\n\n- Launch date set for Q2\n- Weekly sync meetings on Tuesdays\n- Need to finalize design specs by next week',
    editedAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: 2,
    title: 'Ideas for App',
    content:
      'Feature ideas to explore:\n\n1. Dark mode support\n2. Export to PDF\n3. Collaborative editing\n4. Tags and categories',
    editedAt: new Date('2024-01-14T15:45:00'),
  },
  {
    id: 3,
    title: 'Book Recommendations',
    content:
      '- "Atomic Habits" by James Clear\n- "Deep Work" by Cal Newport\n- "The Pragmatic Programmer"',
    editedAt: new Date('2024-01-13T09:00:00'),
  },
  {
    id: 4,
    title: 'Weekly Goals',
    content:
      'This week I want to:\n\n- Complete the notes feature\n- Review pull requests\n- Prepare presentation for Friday',
    editedAt: new Date('2024-01-12T08:00:00'),
  },
];

let notes = [...MOCK_NOTES];
let nextId = 5;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const noteService = {
  async getNotes(): Promise<Note[]> {
    await delay(300);
    return [...notes].sort(
      (a, b) => b.editedAt.getTime() - a.editedAt.getTime()
    );
  },

  async searchNotes(query: string): Promise<Note[]> {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime());
  },

  async getNote(id: number): Promise<Note | null> {
    await delay(100);
    return notes.find((note) => note.id === id) ?? null;
  },

  async createNote(input: CreateNoteInput): Promise<Note> {
    await delay(300);
    const newNote: Note = {
      id: nextId++,
      title: input.title,
      content: input.content,
      editedAt: new Date(),
    };
    notes.push(newNote);
    return newNote;
  },

  async updateNote(id: number, input: UpdateNoteInput): Promise<Note> {
    await delay(300);
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new Error('Note not found');
    }
    notes[index] = {
      ...notes[index],
      ...input,
      editedAt: new Date(),
    };
    return notes[index];
  },

  async deleteNote(id: number): Promise<void> {
    await delay(200);
    const index = notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new Error('Note not found');
    }
    notes.splice(index, 1);
  },
};
