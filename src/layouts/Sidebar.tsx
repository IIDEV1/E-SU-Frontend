import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useEffect } from "react";
import { navigationItems } from "@/constants/navigation";
import { useAuth } from "@/features/auth/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export function Sidebar({ isCollapsed, isDrawerOpen, onCloseDrawer }: SidebarProps) {
  const { hasRole } = useAuth();
  useEffect(() => { const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onCloseDrawer(); }; if (isDrawerOpen) window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [isDrawerOpen, onCloseDrawer]);

  return (
    <>
      {isDrawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={onCloseDrawer}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""} ${isDrawerOpen ? "sidebar--open" : ""}`}
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
