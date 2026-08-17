import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/layouts/AuthLayout";
import { authApi } from "@/services/endpoints/auth.api";

const schema = z.object({ email: z.string().email("Введите корректный email") });

export function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <AuthLayout>
      <form
        className="auth-card"
        onSubmit={handleSubmit(async ({ email }) => {
          await authApi.forgotPassword(email);
          setMessage("Инструкция отправлена на вашу почту.");
        })}
      >
        <span className="accent-badge">Recovery</span>
        <h2>Восстановление пароля</h2>
        <p>Укажите рабочую почту, мы отправим ссылку для восстановления доступа.</p>
        <label>
          Email
          <input type="email" {...register("email")} />
          {errors.email && <small>{errors.email.message}</small>}
        </label>
        {message && <div className="form-success">{message}</div>}
        <Button loading={isSubmitting} disabled={isSubmitting} icon={<Mail size={18} />} type="submit">
          Отправить
        </Button>
        <Link to="/login">Вернуться ко входу</Link>
      </form>
    </AuthLayout>
  );
}
