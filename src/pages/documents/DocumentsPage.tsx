import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DocumentTable } from "@/features/documents/DocumentTable";
import { useDocuments } from "@/hooks/useDocuments";
import type { DocumentStatus } from "@/types";

const pageCopy: Record<string, { title: string; description: string; status?: DocumentStatus; owner?: "me" }> = {
  all: { title: "Документы", description: "Единый журнал документов университета." },
  my: {
    title: "Мои документы",
    description: "Черновики и отправленные вами документы.",
    owner: "me",
  },
  approval: {
    title: "На согласовании",
    description: "Документы, ожидающие решения ответственных сотрудников.",
    status: "in_review",
  },
  returned: {
    title: "Возвращенные",
    description: "Документы, требующие доработки и повторной отправки.",
    status: "returned",
  },
  archive: {
    title: "Архив",
    description: "Завершенные и архивные документы.",
    status: "archived",
  },
};

export function DocumentsPage({ scope = "all" }: { scope?: keyof typeof pageCopy }) {
  const copy = pageCopy[scope];
  const { data, isError, isLoading } = useDocuments({ status: copy.status, owner: copy.owner });

  return (
    <div className="page-stack">
      <section className="page-heading documents-page-heading">
        <div>
          <span className="accent-badge">Documents</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <Link to="/documents/create">
          <Button icon={<Plus size={18} />}>Создать документ</Button>
        </Link>
      </section>
      <DocumentTable documents={data?.data ?? []} fixedStatus={copy.status} isError={isError} isLoading={isLoading} />
    </div>
  );
}
