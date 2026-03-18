import { type FC } from 'react';

export interface BiobeatsLogoProps {
  size?: number;
  color?: string;
  className?: string;
}

export const BiobeatsLogo: FC<BiobeatsLogoProps> = ({
  size = 32,
  color = '#ff5500',
  className,
}) => {
  const h = size * 0.6;
  return (
    <svg
      className={className}
      width={size}
      height={h}
      viewBox="0 0 120 68"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Biobeats"
      role="img"
    >
      {/* Waveform bars */}
      <rect x="2"  y="40" width="4" height="28" rx="2" opacity="0.5" />
      <rect x="10" y="30" width="4" height="38" rx="2" opacity="0.6" />
      <rect x="18" y="18" width="4" height="50" rx="2" opacity="0.7" />
      <rect x="26" y="10" width="4" height="58" rx="2" opacity="0.8" />
      <rect x="34" y="16" width="4" height="52" rx="2" opacity="0.9" />
      <rect x="42" y="6"  width="4" height="62" rx="2" />

      {/* Cloud body */}
      <path d="
        M50 68
        L50 22
        C50 22 52 2 72 2
        C86 2 92 14 94 18
        C96 10 102 6 110 8
        C118 10 120 22 120 28
        C120 40 112 46 104 46
        L104 68
        Z
      " />
    </svg>
  );
};
