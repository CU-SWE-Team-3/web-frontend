import { type FC, type MouseEventHandler } from 'react';
import s from './GenreTag.module.scss';

export interface GenreTagProps {
  genre: string;
  variant?: 'outlined' | 'filled';
  onClick?: MouseEventHandler<HTMLSpanElement>;
  className?: string;
}

export const GenreTag: FC<GenreTagProps> = ({
  genre,
  variant = 'outlined',
  onClick,
  className,
}) => (
  <span
    className={[s.tag, s[variant], className].filter(Boolean).join(' ')}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    # {genre}
  </span>
);
