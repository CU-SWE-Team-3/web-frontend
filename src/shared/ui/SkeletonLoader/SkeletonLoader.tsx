import { type FC, type CSSProperties } from 'react';
import s from './SkeletonLoader.module.scss';

export interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean | 'circle';
  lines?: number;
  className?: string;
  style?: CSSProperties;
}

export const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 16,
  rounded = true,
  lines,
  className,
  style,
}) => {
  const radiusCls =
    rounded === 'circle' ? s.circle : rounded ? s.rounded : '';

  const blockStyle: CSSProperties = { width, height, ...style };

  if (lines && lines > 1) {
    return (
      <div className={s.lines} role="status" aria-label="Loading…">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={[s.skeleton, radiusCls, className]
              .filter(Boolean)
              .join(' ')}
            style={{
              ...blockStyle,
              width: i === lines - 1 ? '60%' : width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={[s.skeleton, radiusCls, className]
        .filter(Boolean)
        .join(' ')}
      style={blockStyle}
      role="status"
      aria-label="Loading…"
    />
  );
};
