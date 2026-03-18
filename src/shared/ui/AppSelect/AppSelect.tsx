import type { SelectHTMLAttributes } from "react";
import styles from "./AppSelect.module.scss";

type AppSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function AppSelect({
  className,
  children,
  ...props
}: AppSelectProps) {
  return (
    <select
      {...props}
      className={[styles.select, className].filter(Boolean).join(" ")}
    >
      {children}
    </select>
  );
}
