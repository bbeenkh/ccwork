import { clsx } from 'clsx';

interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <hr className={clsx('divider', className)} />;
}
