import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthLayout } from "@/layouts/AuthLayout";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(4, "Минимум 4 символа"),
  remember: z.boolean(),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/dashboard";
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { email: "aidana@esu.kg", password: "demo1234", remember: true },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось войти.");
    }
  });

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={onSubmit}>
        <span className="accent-badge">Вход</span>
        <h2>Добро пожаловать</h2>
        <p>Используйте корпоративную учетную запись для доступа к документам.</p>
        <label>
          Email
          <input type="email" {...register("email")} />
          {errors.email && <small>{errors.email.message}</small>}
        </label>
        <label>
          Пароль
          <span className="password-field">
            <input type={isPasswordVisible ? "text" : "password"} {...register("password")} />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((value) => !value)}
              aria-label="Показать пароль"
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {errors.password && <small>{errors.password.message}</small>}
        </label>
        <div className="form-row">
          <label className="checkbox-label">
            <input type="checkbox" {...register("remember")} />
            Запомнить меня
          </label>
          <Link to="/forgot-password">Забыли пароль?</Link>
        </div>
        {error && <div className="form-error">{error}</div>}
        <Button disabled={!isValid || isLoading} icon={<LogIn size={18} />} type="submit">
          {isLoading ? "Входим..." : "Войти"}
        </Button>
      </form>
    </AuthLayout>
  );
}
