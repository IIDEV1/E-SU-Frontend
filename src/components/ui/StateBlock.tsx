import type { ReactNode } from "react";

export function StateBlock({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-block">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
