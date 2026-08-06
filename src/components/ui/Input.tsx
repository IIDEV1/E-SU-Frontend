import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="ui-field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`ui-control ${error ? "ui-control--error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="ui-field__error">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
