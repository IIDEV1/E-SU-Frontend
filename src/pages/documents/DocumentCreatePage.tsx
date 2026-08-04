import { DocumentForm } from "@/features/documents/DocumentForm";

export function DocumentCreatePage() {
  return (
    <div className="page-stack">
      <section className="page-heading">
        <span className="accent-badge">Create</span>
        <h1>Создать документ</h1>
        <p>Заполните карточку, приложите файлы и отправьте документ на согласование.</p>
      </section>
      <DocumentForm mode="create" />
    </div>
  );
}
