import { type FC, type MouseEventHandler, type ReactNode } from 'react';
import s from './SocialButton.module.scss';

type Provider = 'facebook' | 'google' | 'apple';

const ICONS: Record<Provider, string> = {
  facebook: 'ⓕ',
  google: 'G',
  apple: '',
};

export interface SocialButtonProps {
  provider: Provider;
  label?: string;
  icon?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const SocialButton: FC<SocialButtonProps> = ({
  provider,
  label,
  icon,
  onClick,
  className,
}) => (
  <button
    data-testid={`social-button-${provider}`}
    className={[s.btn, s[provider], className].filter(Boolean).join(' ')}
    onClick={onClick}
  >
    <span className={s.icon}>{icon ?? ICONS[provider]}</span>
    {label ?? `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
  </button>
);
