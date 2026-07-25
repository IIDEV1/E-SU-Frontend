import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

export function ProfileDropdown() {
  const { logout, user } = useAuth();

  return (
    <div className="profile-menu">
      <div>
        <strong>{user?.name}</strong>
        <span>{user?.position}</span>
      </div>
      <button className="icon-button" type="button" onClick={logout} aria-label="Выйти">
        <LogOut size={18} />
      </button>
    </div>
  );
}
