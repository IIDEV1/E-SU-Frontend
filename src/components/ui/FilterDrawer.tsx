import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onReset?: () => void;
  children: React.ReactNode;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  title = 'Фильтры',
  onReset,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-bottom">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 16 }}>
            <SlidersHorizontal size={18} />
            <span>{title}</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          {children}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {onReset && (
            <button
              type="button"
              className="button button--secondary"
              style={{ flex: 1 }}
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              Сбросить
            </button>
          )}
          <button
            type="button"
            className="button button--primary"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Применить
          </button>
        </div>
      </div>
    </>
  );
};