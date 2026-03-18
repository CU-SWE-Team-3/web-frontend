import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./AppButton.module.scss";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

export default function AppButton({
  icon,
  children,
  className,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={[styles.button, className].filter(Boolean).join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}
