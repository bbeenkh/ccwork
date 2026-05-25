import { Note } from '../types/note';
import { Card, CardTitle, CardPreview, CardFooter } from './shared/Card';
import { Tag } from './shared/Tag';
import type { TagColor } from './shared/Tag';
import { stripHtml } from '../utils/stripHtml';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const TAG_COLORS: TagColor[] = ['indigo', 'pink', 'rose'];

function getTagColor(tag: string): TagColor {
  const sum = [...tag].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TAG_COLORS[sum % TAG_COLORS.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function MoreIcon() {
  return (
    <svg width="3" height="12" viewBox="0 0 3 14" fill="currentColor" aria-hidden="true">
      <circle cx="1.5" cy="1.5" r="1.5" />
      <circle cx="1.5" cy="7" r="1.5" />
      <circle cx="1.5" cy="12.5" r="1.5" />
    </svg>
  );
}

/**
 * Render a selectable note card showing title, a sanitized content preview, tags, updated date, and a delete action.
 *
 * @param note - The note to display; expected to include `id`, `title`, `content`, `tags`, and `updatedAt`
 * @param isSelected - Whether the card is visually marked as selected
 * @param onSelect - Callback invoked with the note `id` when the card is clicked
 * @param onDelete - Callback invoked with the note `id` when the delete action is triggered
 * @returns A card element representing the provided note with preview, metadata, and actions
 */
export function NoteItem({ note, isSelected, onSelect, onDelete }: NoteItemProps) {
  const hasTags = note.tags && note.tags.length > 0;

  return (
    <Card isSelected={isSelected} onClick={() => onSelect(note.id)}>
      <CardTitle>{note.title || '(제목 없음)'}</CardTitle>

      {note.content && <CardPreview>{stripHtml(note.content)}</CardPreview>}

      <CardFooter
        date={formatDate(note.updatedAt)}
        tags={
          hasTags ? (
            <>
              {note.tags.map((tag) => (
                <Tag key={tag} label={`#${tag}`} color={getTagColor(tag)} />
              ))}
            </>
          ) : undefined
        }
        actions={
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            aria-label={`${note.title} 삭제`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-foreground-subtle)',
              padding: '2px 4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-destructive)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-foreground-subtle)')}
          >
            <MoreIcon />
          </button>
        }
      />
    </Card>
  );
}
