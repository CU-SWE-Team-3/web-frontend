import { type FC } from 'react';

export interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export const VerifiedBadge: FC<VerifiedBadgeProps> = ({
  size = 14,
  className,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Verified"
    role="img"
  >
    <circle cx="8" cy="8" r="8" fill="var(--sc-verified, #3da1f2)" />
    <path
      d="M6.5 11L4 8.5l1-1 1.5 1.5L10.5 5l1 1L6.5 11z"
      fill="var(--sc-white, #fff)"
    />
  </svg>
);
