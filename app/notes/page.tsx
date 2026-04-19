'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthGuard } from '@/components/auth-guard';
import { Navigation } from '@/components/navigation';
import { noteService } from '@/services/note-service';
import type { Note } from '@/types/note';
import { Plus, Search, FileText, Trash2, Save, ArrowLeft } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { DeleteModal } from '@/components/ui/card/delete-modal';
import { useTranslations } from '@/contexts/language-context';

const DRAFT_STORAGE_KEY = 'notes_draft';

interface NoteDraft {
  noteId: number;
  title: string;
  content: string;
}

function saveDraft(draft: NoteDraft | null): void {
  if (draft) {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } else {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  }
}

function loadDraft(): NoteDraft | null {
  const stored = sessionStorage.getItem(DRAFT_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as NoteDraft;
  } catch {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    return null;
  }
}

export default function NotesPage() {
  const t = useTranslations('notes');

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const initializedRef = useRef(false);

  const loadNotes = useCallback(async (query?: string) => {
    try {
      setIsLoading(true);
      const userNotes = query
        ? await noteService.searchNotes(query)
        : await noteService.getNotes();
      setNotes(userNotes);
      return userNotes;
    } catch (error) {
      console.error('Failed to load notes:', error);
      showToast({
        title: t('failedToLoad'),
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialize = async () => {
      const userNotes = await loadNotes();

      const draft = loadDraft();
      if (draft) {
        const note = userNotes.find((n) => n.id === draft.noteId);
        if (note) {
          setSelectedNote(note);
          setEditTitle(draft.title);
          setEditContent(draft.content);
          setHasUnsavedChanges(
            draft.title !== note.title || draft.content !== note.content
          );
          showToast({
            title: t('draftRestored'),
            description: t('draftRestoredDescription'),
          });
        } else {
          saveDraft(null);
        }
      }
    };

    initialize();
  }, [loadNotes]);

  useEffect(() => {
    if (!initializedRef.current) return;

    loadNotes(searchQuery);
  }, [searchQuery, loadNotes]);

  useEffect(() => {
    if (selectedNote) {
      const titleChanged = editTitle !== selectedNote.title;
      const contentChanged = editContent !== selectedNote.content;
      const unsaved = titleChanged || contentChanged;
      setHasUnsavedChanges(unsaved);

      if (unsaved) {
        saveDraft({
          noteId: selectedNote.id,
          title: editTitle,
          content: editContent,
        });
      } else {
        saveDraft(null);
      }
    }
  }, [editTitle, editContent, selectedNote]);

  const handleSelectNote = (note: Note) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(t('unsavedChangesSwitch'));
      if (!confirmSwitch) return;
    }
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setHasUnsavedChanges(false);
    saveDraft(null);
  };

  const handleBackToList = () => {
    if (hasUnsavedChanges) {
      const confirmBack = window.confirm(t('unsavedChangesBack'));
      if (!confirmBack) return;
    }
    setSelectedNote(null);
    setEditTitle('');
    setEditContent('');
    setHasUnsavedChanges(false);
    saveDraft(null);
  };

  const handleCreateNote = async () => {
    if (hasUnsavedChanges) {
      const confirmCreate = window.confirm(t('unsavedChangesCreate'));
      if (!confirmCreate) return;
    }

    try {
      const newNote = await noteService.createNote({
        title: t('untitled'),
        content: '',
      });
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      setEditTitle(newNote.title);
      setEditContent(newNote.content);
      setHasUnsavedChanges(false);
      saveDraft(null);
      showToast({
        title: t('noteCreated'),
        description: t('startWriting'),
      });
    } catch (error) {
      showToast({
        title: t('failedToCreate'),
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      setIsSaving(true);
      const updatedNote = await noteService.updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
      });
      setSelectedNote(updatedNote);
      setNotes((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      setHasUnsavedChanges(false);
      saveDraft(null);
      showToast({
        title: t('noteSaved'),
        description: t('noteSavedDescription'),
      });
    } catch (error) {
      showToast({
        title: t('failedToSave'),
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (note: Note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    await noteService.deleteNote(noteToDelete.id);
    setNotes((prev) => prev.filter((note) => note.id !== noteToDelete.id));
    if (selectedNote?.id === noteToDelete.id) {
      setSelectedNote(null);
      setEditTitle('');
      setEditContent('');
      setHasUnsavedChanges(false);
      saveDraft(null);
    }
    showToast({
      title: t('noteDeleted'),
      description: t('noteDeletedDescription'),
    });
    setNoteToDelete(null);
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-64">
        <Navigation />
        <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-2xl font-semibold text-foreground">
              {t('title')}
            </h1>
          </div>

          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            <aside
              className={cn(
                'flex flex-col bg-muted/30',
                'w-full md:w-80 md:border-r md:border-border',
                selectedNote ? 'hidden md:flex' : 'flex'
              )}
            >
              <div className="p-3 space-y-3 border-b border-border md:border-b-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleCreateNote} className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('newNote')}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {t('loading')}
                  </div>
                ) : notes.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchQuery ? t('noNotesFound') : t('noNotesYet')}
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {notes.map((note) => (
                      <li key={note.id}>
                        <button
                          onClick={() => handleSelectNote(note)}
                          className={cn(
                            'w-full text-left p-3 hover:bg-muted/50 transition-colors',
                            selectedNote?.id === note.id && 'bg-primary/10'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {note.title || t('untitled')}
                              </p>
                              <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {note.content.slice(0, 50) || t('noContent')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(note.editedAt)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(note);
                              }}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>

            <main
              className={cn(
                'flex-1 flex flex-col',
                selectedNote ? 'flex' : 'hidden md:flex'
              )}
            >
              {selectedNote ? (
                <>
                  <div className="p-4 border-b border-border flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToList}
                      className="md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      {t('back')}
                    </Button>
                    <Input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={t('titlePlaceholder')}
                      className="flex-1 text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
                    />
                    <Button
                      onClick={handleSaveNote}
                      disabled={!hasUnsavedChanges || isSaving}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? t('saving') : t('save')}
                    </Button>
                  </div>
                  <div className="flex-1 p-4">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder={t('contentPlaceholder')}
                      className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
                    />
                  </div>
                  <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
                    {t('lastEdited', {
                      date: formatDate(selectedNote.editedAt),
                    })}
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-amber-500">
                        {'• ' + t('unsavedChanges')}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">{t('selectNote')}</p>
                    <p className="text-sm mt-1">{t('selectNoteDescription')}</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={t('deleteNote')}
        itemName={noteToDelete?.title || t('untitled')}
        onConfirm={handleDeleteNote}
        confirmLabel={t('deleteNote')}
        itemDetails={
          noteToDelete && (
            <div className="text-sm">
              <div className="font-medium text-foreground mb-1">
                {noteToDelete.title || t('untitled')}
              </div>
              <div className="text-muted-foreground text-xs">
                {noteToDelete.content && (
                  <div className="mb-1 line-clamp-2">
                    {noteToDelete.content}
                  </div>
                )}
                <div>
                  {t('lastEdited', { date: formatDate(noteToDelete.editedAt) })}
                </div>
              </div>
            </div>
          )
        }
      />
    </AuthGuard>
  );
}
