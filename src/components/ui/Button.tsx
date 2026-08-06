import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  children,
  className = "",
  icon,
  loading = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button className={`button button--${variant} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <LoaderCircle aria-hidden="true" className="ui-spinner" size={16} /> : icon}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({ className = "", children, "aria-label": ariaLabel, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`icon-button ${className}`} type={props.type ?? "button"} aria-label={ariaLabel} {...props}>{children}</button>;
}
