import type { TextareaHTMLAttributes } from "react";
import styles from "./AppTextarea.module.scss";

type AppTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function AppTextarea({ className, ...props }: AppTextareaProps) {
  return (
    <textarea
      {...props}
      className={[styles.textarea, className].filter(Boolean).join(" ")}
    />
  );
}
