import { Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { DocumentTable } from "@/features/documents/DocumentTable";
import type { DocumentListScope } from "@/services/endpoints/documents.api";
import type { DocumentStatus } from "@/types";

interface DocumentPageCopy {
  title: string;
  description: string;
  fixedStatus?: DocumentStatus;
}

const pageCopy: Record<DocumentListScope, DocumentPageCopy> = {
  all: { title: "Документы", description: "Единый журнал документов университета." },
  my: { title: "Мои документы", description: "Созданные вами документы." },
  approval: {
    title: "На согласовании",
    description: "Документы, ожидающие вашего решения.",
    fixedStatus: "in_review",
  },
  returned: {
    title: "Возвращённые",
    description: "Созданные вами документы, требующие доработки.",
    fixedStatus: "returned",
  },
  overdue: {
    title: "Просроченные",
    description: "Доступные вам документы с истёкшим дедлайном.",
    fixedStatus: "overdue",
  },
  archive: {
    title: "Архив",
    description: "Архивные документы.",
    fixedStatus: "archived",
  },
};

export function DocumentsPage({ scope = "all" }: { scope?: DocumentListScope }) {
  const [searchParams] = useSearchParams();
  const effectiveScope = scope === "all" && searchParams.get("scope") === "overdue" ? "overdue" : scope;
  const copy = pageCopy[effectiveScope];

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
      <DocumentTable key={effectiveScope} scope={effectiveScope} fixedStatus={copy.fixedStatus} />
    </div>
  );
}
