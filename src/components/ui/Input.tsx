import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="ui-field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`ui-control ${error ? "ui-control--error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="ui-field__error">{error}</span>}
    </div>
  );
}
