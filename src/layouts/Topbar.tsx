import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Breadcrumbs } from "@/layouts/Breadcrumbs";
import { NotificationDropdown } from "@/layouts/NotificationDropdown";
import { ProfileDropdown } from "@/layouts/ProfileDropdown";

interface TopbarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenDrawer: () => void;
}

export function Topbar({ isCollapsed, onOpenDrawer, onToggleCollapse }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="icon-button mobile-only"
          type="button"
          onClick={onOpenDrawer}
          aria-label="Открыть меню"
        >
          <Menu size={19} />
        </button>
        <button
          className="icon-button desktop-only"
          type="button"
          onClick={onToggleCollapse}
          aria-label="Свернуть меню"
        >
          {isCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>
        <Breadcrumbs />
      </div>
      <div className="topbar__actions">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}