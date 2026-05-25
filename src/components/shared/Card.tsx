import { clsx } from 'clsx';

interface CardProps {
  /** true일 때 핀된 노트 스타일(인디고 배경)로 표시 */
  isAccent?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Render a note-styled card container with optional accent, selection state, and click/keyboard activation.
 *
 * When `onClick` is provided the element is focusable, given `role="button"`, and activates `onClick` when the Enter key is pressed.
 *
 * @param isAccent - When truthy, applies accent styling to the card.
 * @param isSelected - When truthy, marks the card as selected and sets `aria-selected` accordingly.
 * @param onClick - Optional click handler; enabling this makes the card interactive via mouse and keyboard.
 * @param className - Additional CSS classes appended to the card element.
 * @param children - Content rendered inside the card.
 * @returns The card element.
 */
export function Card({ isAccent, isSelected, onClick, className, children }: CardProps) {
  return (
    <div
      className={clsx(
        'note-card',
        isAccent && 'note-card-accent',
        isSelected && 'selected',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-selected={isSelected}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return <p className={clsx('note-card-title', className)}>{children}</p>;
}

interface CardPreviewProps {
  className?: string;
  children: React.ReactNode;
}

export function CardPreview({ className, children }: CardPreviewProps) {
  return <p className={clsx('note-card-preview', className)}>{children}</p>;
}

interface CardFooterProps {
  date?: string;
  tags?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function CardFooter({ date, tags, actions, className }: CardFooterProps) {
  return (
    <div className={clsx('note-card-footer', className)}>
      {tags && <div className="flex items-center gap-1 flex-wrap">{tags}</div>}
      <div className="flex items-center gap-2 ml-auto">
        {date && <span className="note-card-meta">{date}</span>}
        {actions}
      </div>
    </div>
  );
}
