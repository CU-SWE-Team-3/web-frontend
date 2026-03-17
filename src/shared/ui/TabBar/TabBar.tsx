'use client';

import { type FC } from 'react';
import s from './TabBar.module.scss';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export const TabBar: FC<TabBarProps> = ({
  tabs,
  activeKey,
  onTabChange,
  className,
}) => (
  <nav className={[s.tabs, className].filter(Boolean).join(' ')} role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        role="tab"
        className={`${s.tab} ${activeKey === tab.key ? s.active : ''}`}
        aria-selected={activeKey === tab.key}
        onClick={() => onTabChange(tab.key)}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);
