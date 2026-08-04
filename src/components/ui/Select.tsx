import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
      <select
        className={`px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors shadow-sm appearance-none
          ${error ? 'border-red-500' : 'border-zinc-200'}
          disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed
          ${className}
        `}
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
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};