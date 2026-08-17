import { useParams } from "react-router-dom";
import { StateBlock } from "@/components/ui/StateBlock";
import { DocumentForm } from "@/features/documents/DocumentForm";
import { useDocument } from "@/hooks/useDocuments";

export function DocumentEditPage() {
  const { id = "" } = useParams();
  const { data, isError, isLoading } = useDocument(id);

  if (isLoading) {
    return <StateBlock title="Загружаем документ" description="Подготавливаем форму редактирования." />;
  }

  if (isError || !data) {
    return <StateBlock title="Документ не найден" description="Проверьте ссылку или вернитесь к списку." />;
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <span className="accent-badge">Edit</span>
        <h1>Редактирование</h1>
        <p>{data.title}</p>
      </section>
      <DocumentForm document={data} mode="edit" />
    </div>
  );
}
