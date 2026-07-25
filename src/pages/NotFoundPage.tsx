import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <section className="empty-page">
      <span className="accent-badge">404</span>
      <h1>Страница не найдена</h1>
      <p>Маршрут отсутствует или документ был перемещен.</p>
      <Link to="/dashboard">
        <Button type="button">На Dashboard</Button>
      </Link>
    </section>
  );
}
