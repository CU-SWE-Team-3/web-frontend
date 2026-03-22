import { type FC, type ReactNode } from 'react';
import s from './EmptyState.module.scss';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div data-testid="empty-state" className={[s.empty, className].filter(Boolean).join(' ')}>
    {icon && <div data-testid="empty-state-icon" className={s.icon}>{icon}</div>}
    <div data-testid="empty-state-title" className={s.title}>{title}</div>
    {description && <div data-testid="empty-state-description" className={s.description}>{description}</div>}
    <div data-testid="empty-state-action">{action}</div>
  </div>
);
