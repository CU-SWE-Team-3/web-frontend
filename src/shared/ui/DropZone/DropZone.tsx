'use client';

import { type FC, type ReactNode, type DragEvent, useState, useCallback } from 'react';
import s from './DropZone.module.scss';

export interface DropZoneProps {
  onDrop?: (files: FileList) => void;
  accept?: string;
  children?: ReactNode;
  label?: string;
  className?: string;
}

export const DropZone: FC<DropZoneProps> = ({
  onDrop, accept, children, label = 'Drag and drop files to get started.', className,
}) => {
  const [over, setOver] = useState(false);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOver(false);
      if (e.dataTransfer.files.length) onDrop?.(e.dataTransfer.files);
    },
    [onDrop],
  );

  return (
    <div
      className={[s.zone, over ? s.dragOver : '', className].filter(Boolean).join(' ')}
      onDragOver={(e) => { handleDrag(e); setOver(true); }}
      onDragLeave={(e) => { handleDrag(e); setOver(false); }}
      onDrop={handleDrop}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        if (accept) input.accept = accept;
        input.multiple = true;
        input.onchange = () => { if (input.files?.length) onDrop?.(input.files); };
        input.click();
      }}
      role="button"
      tabIndex={0}
    >
      <span className={s.icon}>☁</span>
      <span className={s.label}>{label}</span>
      {children}
    </div>
  );
};
