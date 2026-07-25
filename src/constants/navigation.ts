import {
  Archive,
  ClipboardCheck,
  FileClock,
  FilePlus2,
  Files,
  LayoutDashboard,
  RotateCcw,
} from "lucide-react";
import type { UserRole } from "@/types";

export const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Все документы", path: "/documents", icon: Files },
  { label: "Мои документы", path: "/documents/my", icon: FileClock },
  {
    label: "На согласовании",
    path: "/documents/approval",
    icon: ClipboardCheck,
    roles: ["admin", "rector", "department_head", "approver"] satisfies UserRole[],
  },
  { label: "Возвращенные", path: "/documents/returned", icon: RotateCcw },
  { label: "Архив", path: "/documents/archive", icon: Archive },
  { label: "Создать", path: "/documents/create", icon: FilePlus2 },
];
