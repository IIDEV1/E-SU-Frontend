import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Archive,
  Building2,
  ClipboardCheck,
  FileClock,
  FilePlus2,
  Files,
  FolderTree,
  Shield,
  LayoutDashboard,
  RotateCcw,
  Users, 
  Bell,
  History,
  Settings,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<LucideProps>;
  roles?: UserRole[];
}

export const navigationItems: NavItem[] = [
  { label: "Панель управления", path: "/dashboard", icon: LayoutDashboard },
  { label: "Все документы", path: "/documents", icon: Files },
  { label: "Мои документы", path: "/documents/my", icon: FileClock },
  {
    label: "На согласовании",
    path: "/documents/approval",
    icon: ClipboardCheck,
    roles: ["admin", "rector", "department_head", "approver"],
  },
  { label: "Возвращенные", path: "/documents/returned", icon: RotateCcw },
  { label: "Архив", path: "/documents/archive", icon: Archive },
  { label: "Создать", path: "/documents/create", icon: FilePlus2 },
  { 
    label: "Подразделения", 
    path: "/departments", 
    icon: Building2, 
    roles: ["admin"], 
  },
  { 
    label: "Пользователи", 
    path: "/users", 
    icon: Users, 
    roles: ["admin"], 
  },
  { 
    label: "Категории документов", 
    path: "/categories", 
    icon: FolderTree, 
    roles: ["admin"], 
  },
  { 
    label: "Роли и права", 
    path: "/roles", 
    icon: Shield, 
    roles: ["admin"], 
  },
  { 
  label: "Уведомления", 
  path: "/notifications", 
  icon: Bell, 
},
{ 
    label: "Журнал действий", 
    path: "/audit", 
    icon: History, 
    roles: ["admin"], 
  },
  { 
  label: "Настройки", 
  path: "/settings", 
  icon: Settings, 
  roles: ["admin"], 
},
];