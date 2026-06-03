'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Eye, Save } from 'lucide-react';
import { useTranslations } from '@/contexts/language-context';

interface NoteToolbarProps {
  isEditing: boolean;
  onToggleMode: () => void;
  onSave: () => void;
  canSave: boolean;
  isSaving: boolean;
}

export function NoteToolbar({
  isEditing,
  onToggleMode,
  onSave,
  canSave,
  isSaving,
}: NoteToolbarProps) {
  const t = useTranslations('notes');

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleMode}
        aria-label={isEditing ? t('preview') : t('edit')}
      >
        {isEditing ? (
          <Eye className="h-4 w-4 mr-1" />
        ) : (
          <Pencil className="h-4 w-4 mr-1" />
        )}
        {isEditing ? t('preview') : t('edit')}
      </Button>
      <Button onClick={onSave} disabled={!canSave || isSaving} size="sm">
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? t('saving') : t('save')}
      </Button>
    </div>
  );
}
