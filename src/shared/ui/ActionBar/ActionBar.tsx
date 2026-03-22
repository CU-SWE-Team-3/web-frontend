'use client';

import { type FC, type MouseEventHandler, type ReactNode } from 'react';
import s from './ActionBar.module.scss';

export interface ActionItem {
  key: string;
  icon: ReactNode;
  label?: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface ActionBarProps {
  actions: ActionItem[];
  className?: string;
}

export const ActionBar: FC<ActionBarProps> = ({ actions, className }) => (
  <div className={[s.bar, className].filter(Boolean).join(' ')}>
    {actions.map((action) => (
      <button
        key={action.key}
        data-testid={`action-bar-item-${action.key}`}
        className={[
          s.actionBtn,
          action.label ? s.withLabel : '',
          action.active ? s.active : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={action.onClick}
        aria-label={action.label ?? action.key}
      >
        {action.icon}
        {action.label && <span data-testid={`action-bar-label-${action.key}`}>{action.label}</span>}
      </button>
    ))}
  </div>
);
