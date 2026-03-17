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
  <div className={[s.empty, className].filter(Boolean).join(' ')}>
    {icon && <span className={s.icon}>{icon}</span>}
    <span className={s.title}>{title}</span>
    {description && <span className={s.description}>{description}</span>}
    {action}
  </div>
);
