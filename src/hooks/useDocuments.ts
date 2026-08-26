import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi, type DocumentFormPayload, type DocumentsParams } from "@/services/endpoints/documents.api";

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (params: DocumentsParams) =>
    [
      ...documentKeys.lists(),
      {
        scope: params.scope ?? "all",
        search: params.search ?? "",
        status: params.status ?? "",
        category: params.category ?? "",
        department: params.department ?? "",
        author: params.author ?? "",
        createdFrom: params.createdFrom ?? "",
        createdTo: params.createdTo ?? "",
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        ordering: params.ordering ?? "-created_at",
      },
    ] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
};

export function useDocuments(params: DocumentsParams = {}) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentsApi.getDocuments(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsApi.getDocument(id),
    enabled: Boolean(id),
  });
}

function useDocumentInvalidation(id?: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: documentKeys.all });
    if (id) {
      void queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
    }
  };
}

export function useCreateDocument() {
  const invalidate = useDocumentInvalidation();
  return useMutation({
    mutationFn: (payload: DocumentFormPayload & { status: "draft" | "in_review" }) => documentsApi.createDocument(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({
    mutationFn: (payload: Partial<DocumentFormPayload>) => documentsApi.updateDocument(id, payload),
    onSuccess: invalidate,
  });
}

export function useSubmitDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: () => documentsApi.submitDocument(id), onSuccess: invalidate });
}

export function useApproveDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: () => documentsApi.approveDocument(id), onSuccess: invalidate });
}

export function useReturnDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: (reason: string) => documentsApi.returnDocument(id, reason), onSuccess: invalidate });
}

export function useArchiveDocument() {
  const invalidate = useDocumentInvalidation();
  return useMutation({
    mutationFn: (id: string) => documentsApi.archiveDocument(id),
    onSuccess: (_, id) => {
      invalidate();
      void documentsApi.getDocument(id).catch(() => undefined);
    },
  });
}

export function useAddDocumentComment(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: (text: string) => documentsApi.addComment(id, text), onSuccess: invalidate });
}
