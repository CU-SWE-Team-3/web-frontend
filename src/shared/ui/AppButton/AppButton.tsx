import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import s from './AppButton.module.scss';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface AppButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      s.button,
      s[variant],
      s[size],
      disabled && s.disabled,
      loading && s.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <span className={s.spinner} />}
        {leftIcon && <span className="flex shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

AppButton.displayName = 'AppButton';
