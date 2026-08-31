import { Link, useParams } from "react-router-dom";
import { Button, PageError } from "@/components/ui";
import { useAdminUser } from "@/features/admin/hooks";
import { UserForm } from "./UserForm";
export function UserEditPage() { const { id } = useParams(); const user = useAdminUser(id); if (!user) return <PageError description="Пользователь не найден." action={<Link to="/users"><Button>Вернуться к пользователям</Button></Link>} />; return <UserForm user={user} />; }
