import { clsx } from 'clsx';

export type TagColor = 'indigo' | 'violet' | 'teal' | 'amber' | 'rose' | 'slate';

interface TagProps {
  label: string;
  color?: TagColor;
  className?: string;
}

export function Tag({ label, color = 'indigo', className }: TagProps) {
  return (
    <span className={clsx('tag', `tag-${color}`, className)}>
      {label}
    </span>
  );
}
