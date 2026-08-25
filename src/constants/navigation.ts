import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Archive,
  Bell,
  Building2,
  ClipboardCheck,
  FileClock,
  FilePlus2,
  Files,
  FolderTree,
  History,
  LayoutDashboard,
  RotateCcw,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<LucideProps>;
  requiredPermissions?: Permission[];
}

export const navigationItems: NavItem[] = [
  { label: "Панель управления", path: "/dashboard", icon: LayoutDashboard },
  { label: "Все документы", path: "/documents", icon: Files, requiredPermissions: ["documents.view"] },
  { label: "Мои документы", path: "/documents/my", icon: FileClock, requiredPermissions: ["documents.view"] },
  { label: "На согласовании", path: "/documents/approval", icon: ClipboardCheck, requiredPermissions: ["documents.approve"] },
  { label: "Возвращенные", path: "/documents/returned", icon: RotateCcw, requiredPermissions: ["documents.view"] },
  { label: "Архив", path: "/documents/archive", icon: Archive, requiredPermissions: ["documents.view"] },
  { label: "Создать", path: "/documents/create", icon: FilePlus2, requiredPermissions: ["documents.create"] },
  { label: "Уведомления", path: "/notifications", icon: Bell },
  { label: "Подразделения", path: "/departments", icon: Building2, requiredPermissions: ["departments.manage"] },
  { label: "Пользователи", path: "/users", icon: Users, requiredPermissions: ["users.manage"] },
  { label: "Категории документов", path: "/categories", icon: FolderTree, requiredPermissions: ["categories.manage"] },
  { label: "Роли и права", path: "/roles", icon: Shield, requiredPermissions: ["users.manage"] },
  { label: "Журнал действий", path: "/audit", icon: History, requiredPermissions: ["audit.view"] },
  { label: "Настройки", path: "/settings", icon: Settings, requiredPermissions: ["settings.manage"] },
];
