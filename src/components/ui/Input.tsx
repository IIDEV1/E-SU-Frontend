import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
      <input
        className={`px-3 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors shadow-sm
          ${error ? 'border-red-500' : 'border-zinc-200'}
          disabled:bg-zinc-100 disabled:text-zinc-500 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};