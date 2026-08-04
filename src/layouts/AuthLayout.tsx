import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <span className="accent-badge">E-SU</span>
        <h1>Electronic Salymbekov University</h1>
        <p>Единое рабочее пространство для документов, согласований и контроля дедлайнов.</p>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
