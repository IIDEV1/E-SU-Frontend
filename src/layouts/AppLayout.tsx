import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/layouts/Sidebar";
import { Topbar } from "@/layouts/Topbar";

export function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        isCollapsed={isCollapsed}
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={() => setIsDrawerOpen(false)}
      />
      <div className="app-main">
        <Topbar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((value) => !value)}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
