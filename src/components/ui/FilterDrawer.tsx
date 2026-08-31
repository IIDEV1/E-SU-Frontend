import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button, IconButton } from "./Button";

export interface FilterDrawerProps { isOpen: boolean; onClose: () => void; title?: string; onReset?: () => void; children: ReactNode; className?: string; }

export function FilterDrawer({ isOpen, onClose, title = "Фильтры", onReset, children, className = "" }: FilterDrawerProps) {
  useEffect(() => { const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; if (isOpen) window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="filter-drawer" role="dialog" aria-modal="true" aria-label={title}><div className="filter-drawer__backdrop" onMouseDown={onClose} /><section className={`filter-drawer__panel ${className}`}><header className="filter-drawer__header"><span><SlidersHorizontal size={18} aria-hidden="true" />{title}</span><IconButton type="button" aria-label="Закрыть фильтры" onClick={onClose}><X size={20} /></IconButton></header><div className="filter-drawer__content">{children}</div><footer className="filter-drawer__actions">{onReset && <Button type="button" variant="secondary" onClick={() => { onReset(); onClose(); }}>Сбросить</Button>}<Button type="button" onClick={onClose}>Применить</Button></footer></section></div>;
}
