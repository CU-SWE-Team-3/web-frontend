import type { FC } from 'react';

export interface BioBeatsLogoProps {
  iconSize?: number;
  textSize?: number;
  iconColor?: string;
  textColor?: string;
  uppercase?: boolean;
  className?: string;
}

export const BioBeatsLogo: FC<BioBeatsLogoProps> = ({
  iconSize = 28,
  textSize = 18,
  iconColor = '#ff5500',
  textColor = '#fff',
  uppercase = false,
  className,
}) => {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill={iconColor} aria-hidden="true">
        <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
      </svg>
      <span
        style={{
          color: textColor,
          fontSize: textSize,
          fontWeight: 800,
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        {uppercase ? 'BIOBEATS' : 'BioBeats'}
      </span>
    </span>
  );
};
