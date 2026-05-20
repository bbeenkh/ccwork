import { clsx } from 'clsx';

interface CardProps {
  isHoverable?: boolean;
  isSelected?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ isHoverable, isSelected, className, children }: CardProps) {
  return (
    <div className={clsx('card', isHoverable && 'card-hover', isSelected && 'card-selected', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return <div className={clsx('card-header', className)}>{children}</div>;
}

export function CardBody({ className, children }: CardBodyProps) {
  return <div className={clsx('card-body', className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return <div className={clsx('card-footer', className)}>{children}</div>;
}
