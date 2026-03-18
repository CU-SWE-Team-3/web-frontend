import type { InputHTMLAttributes } from "react";
import styles from "./AppInput.module.scss";

type AppInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function AppInput({ className, ...props }: AppInputProps) {
  return (
    <input
      {...props}
      className={[styles.input, className].filter(Boolean).join(" ")}
    />
  );
}
