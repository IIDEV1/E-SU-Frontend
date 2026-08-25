import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/layouts/AuthLayout";
import { authApi } from "@/services/endpoints/auth.api";

const schema = z
  .object({
    new_password: z.string().min(8, "Минимум 8 символов"),
    new_password_confirm: z.string().min(8, "Повторите пароль"),
  })
  .refine((values) => values.new_password === values.new_password_confirm, {
    message: "Пароли не совпадают",
    path: ["new_password_confirm"],
  });

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";
  const hasToken = useMemo(() => Boolean(uid && token), [token, uid]);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout>
      <form
        className="auth-card"
        onSubmit={handleSubmit(async (values) => {
          setError("");
          try {
            await authApi.resetPassword({ uid, token, ...values });
            setMessage("Пароль обновлен. Теперь можно войти с новым паролем.");
          } catch (caughtError) {
            setError(caughtError && typeof caughtError === "object" && "message" in caughtError ? String(caughtError.message) : "Не удалось обновить пароль.");
          }
        })}
      >
        <span className="accent-badge">Reset</span>
        <h2>Новый пароль</h2>
        {!hasToken && <div className="form-error">Ссылка сброса пароля неполная или повреждена.</div>}
        <label>
          Новый пароль
          <input type="password" {...register("new_password")} disabled={!hasToken} />
          {errors.new_password && <small>{errors.new_password.message}</small>}
        </label>
        <label>
          Повторите пароль
          <input type="password" {...register("new_password_confirm")} disabled={!hasToken} />
          {errors.new_password_confirm && <small>{errors.new_password_confirm.message}</small>}
        </label>
        {message && <div className="form-success">{message}</div>}
        {error && <div className="form-error">{error}</div>}
        <Button loading={isSubmitting} disabled={isSubmitting || !hasToken} icon={<KeyRound size={18} />} type="submit">
          Сохранить пароль
        </Button>
        <Link to="/login">Вернуться ко входу</Link>
      </form>
    </AuthLayout>
  );
}
