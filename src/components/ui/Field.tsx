import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Field({ label, hint, error, htmlFor, children, className }: FieldProps) {
  return (
    <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
        </label>
      )}
      {children}
      {error ? <p className={styles.error}>{error}</p> : hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}

export function Input({ className, invalid = false, disabled, ...rest }: InputProps) {
  const classes = [styles.input, invalid ? styles.invalid : '', disabled ? styles.disabled : '', className ?? ''].filter(Boolean).join(' ');
  return <input className={classes} disabled={disabled} {...rest} />;
}

export function Select({ className, invalid = false, disabled, ...rest }: SelectProps) {
  const classes = [styles.select, invalid ? styles.invalid : '', disabled ? styles.disabled : '', className ?? ''].filter(Boolean).join(' ');
  return <select className={classes} disabled={disabled} {...rest} />;
}

export function Textarea({ className, invalid = false, disabled, ...rest }: TextareaProps) {
  const classes = [styles.textarea, invalid ? styles.invalid : '', disabled ? styles.disabled : '', className ?? ''].filter(Boolean).join(' ');
  return <textarea className={classes} disabled={disabled} {...rest} />;
}
