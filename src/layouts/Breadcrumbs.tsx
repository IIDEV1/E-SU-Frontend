import { Link, useLocation } from "react-router-dom";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  documents: "Документы",
  my: "Мои",
  approval: "Согласование",
  returned: "Возвращенные",
  archive: "Архив",
  create: "Создание",
  edit: "Редактирование",
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <div className="breadcrumbs">
      <Link to="/dashboard">E-SU</Link>
      {parts.map((part, index) => {
        const href = `/${parts.slice(0, index + 1).join("/")}`;
        return (
          <span key={href}>
            <span>/</span>
            <Link to={href}>{labels[part] ?? part}</Link>
          </span>
        );
      })}
    </div>
  );
}
