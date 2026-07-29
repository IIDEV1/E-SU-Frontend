import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { navigationItems } from "@/constants/navigation";
import { useAuth } from "@/features/auth/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export function Sidebar({ isCollapsed, isDrawerOpen, onCloseDrawer }: SidebarProps) {
  const { hasRole } = useAuth();

  return (
    <>
      {/* 1. Затемненный фон рендерится ПЕРВЫМ и имеет z-index ниже (z-40) */}
      {isDrawerOpen && (
        <div
          className="drawer-backdrop fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseDrawer}
          aria-hidden="true"
        />
      )}

      {/* 2. Возвращаем ваш оригинальный дизайн с классами sidebar, 
          но добавляем z-50, чтобы сайдбар был поверх фона и кнопки нажимались */}
      <aside
        className={`sidebar z-50 ${isCollapsed ? "sidebar--collapsed" : ""} ${isDrawerOpen ? "sidebar--open" : ""}`}
      >
        <div className="sidebar__brand">
          <span className="logo-mark">ES</span>
          {!isCollapsed && <strong>E-SU</strong>}
          <button
            className="icon-button sidebar__close"
            type="button"
            onClick={onCloseDrawer}
            aria-label="Закрыть меню"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar__nav">
          {navigationItems
            .filter((item) => hasRole(item.roles))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className="sidebar__link"
                onClick={onCloseDrawer}
              >
                <item.icon size={18} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
}