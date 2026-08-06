import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, error, options, className = "", id, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <div className="ui-field">
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={`ui-control ${error ? "ui-control--error" : ""} ${className}`}
        {...props}
      >
        <option value="" disabled hidden>
          Выберите...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="ui-field__error">{error}</span>}
    </div>
  );
}
