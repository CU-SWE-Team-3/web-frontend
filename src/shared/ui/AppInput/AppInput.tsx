import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import s from './AppInput.module.scss';

export interface AppInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, disabled, className, id, ...rest },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    const wrapperCls = [
      s.wrapper,
      error && s.error,
      disabled && s.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputCls = [
      s.input,
      leftIcon && s.hasLeft,
      rightIcon && s.hasRight,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperCls}>
        {label && (
          <label htmlFor={inputId} className={s.label}>
            {label}
          </label>
        )}

        <div className={s.inputWrap}>
          {leftIcon && (
            <span className={`${s.icon} ${s.iconLeft}`}>{leftIcon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputCls}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...rest}
          />

          {rightIcon && (
            <span className={`${s.icon} ${s.iconRight}`}>{rightIcon}</span>
          )}
        </div>

        {error && (
          <span id={`${inputId}-error`} className={s.errorMsg} role="alert">
            {error}
          </span>
        )}
        {!error && hint && (
          <span id={`${inputId}-hint`} className={s.hint}>
            {hint}
          </span>
        )}
      </div>
    );
  },
);

AppInput.displayName = 'AppInput';
