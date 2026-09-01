import { Link, useParams } from "react-router-dom";
import { Button, PageError, PageLoader } from "@/components/ui";
import { useAdminUserQuery } from "@/features/admin/hooks";
import { UserForm } from "./UserForm";

export function UserEditPage() {
  const { id } = useParams();
  const query = useAdminUserQuery(id);
  if (query.isLoading) return <PageLoader label="Загрузка пользователя" />;
  if (query.isError) return <PageError description={query.error instanceof Error ? query.error.message : "Не удалось загрузить пользователя."} action={<Link to="/users"><Button>Вернуться к пользователям</Button></Link>} />;
  if (!query.data) return <PageError description="Пользователь не найден." action={<Link to="/users"><Button>Вернуться к пользователям</Button></Link>} />;
  return <UserForm user={query.data} />;
}
