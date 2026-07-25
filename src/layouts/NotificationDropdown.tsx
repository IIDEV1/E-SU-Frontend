import { Bell } from "lucide-react";

export function NotificationDropdown() {
  return (
    <button className="notification-button" type="button" aria-label="Уведомления">
      <Bell size={18} />
      <span>2</span>
    </button>
  );
}
