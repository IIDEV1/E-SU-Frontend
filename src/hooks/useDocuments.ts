import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi, type DocumentFormPayload, type DocumentsParams } from "@/services/endpoints/documents.api";
import { dashboardKeys } from "@/hooks/useDashboard";
import { notificationKeys } from "@/hooks/useNotifications";

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
  files: (id: string) => [...documentKeys.all, "files", id] as const,
  comments: (id: string) => [...documentKeys.all, "comments", id] as const,
  approval: (id: string) => [...documentKeys.all, "approval", id] as const,
  history: (id: string) => [...documentKeys.all, "history", id] as const,
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

export function useDocumentApprovalRoute(id: string) {
  return useQuery({
    queryKey: documentKeys.approval(id),
    queryFn: () => documentsApi.getApprovalRoute(id),
    enabled: Boolean(id),
  });
}

export function useDocumentFiles(id: string) {
  return useQuery({
    queryKey: documentKeys.files(id),
    queryFn: () => documentsApi.getDocumentFiles(id),
    enabled: Boolean(id),
  });
}

export function useDocumentComments(id: string) {
  return useQuery({
    queryKey: documentKeys.comments(id),
    queryFn: () => documentsApi.getDocumentComments(id),
    enabled: Boolean(id),
  });
}

export function useDocumentHistory(id: string) {
  return useQuery({
    queryKey: documentKeys.history(id),
    queryFn: () => documentsApi.getDocumentHistory(id),
    enabled: Boolean(id),
  });
}

export async function invalidateDocumentWorkflow(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: documentKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) }),
    queryClient.invalidateQueries({ queryKey: documentKeys.files(id) }),
    queryClient.invalidateQueries({ queryKey: documentKeys.comments(id) }),
    queryClient.invalidateQueries({ queryKey: documentKeys.approval(id) }),
    queryClient.invalidateQueries({ queryKey: documentKeys.history(id) }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  ]);
}

function useDocumentInvalidation(id?: string) {
  const queryClient = useQueryClient();
  return async () => {
    if (id) {
      await invalidateDocumentWorkflow(queryClient, id);
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: documentKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
    ]);
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

export function useUpdateAndSubmitDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({
    mutationFn: (payload: Partial<DocumentFormPayload>) => documentsApi.updateAndSubmitDocument(id, payload),
    onSuccess: invalidate,
  });
}

export function useSubmitDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: (approverIds: string[] = []) => documentsApi.submitDocument(id, approverIds), onSuccess: invalidate });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.archiveDocument(id),
    onSuccess: (_, id) => invalidateDocumentWorkflow(queryClient, id),
  });
}

export function useRegisterDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: () => documentsApi.registerDocument(id), onSuccess: invalidate });
}

export function useCompleteDocument(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: () => documentsApi.completeDocument(id), onSuccess: invalidate });
}

export function useRestoreDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => documentsApi.restoreDocument(id), onSuccess: () => invalidateDocumentWorkflow(queryClient, id) });
}

export function useAddDocumentComment(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({ mutationFn: (text: string) => documentsApi.addComment(id, text), onSuccess: invalidate });
}

export function useUploadDocumentFile(id: string) {
  const invalidate = useDocumentInvalidation(id);
  return useMutation({
    mutationFn: ({ file, isMain = false }: { file: File; isMain?: boolean }) =>
      documentsApi.uploadDocumentFile(id, file, isMain),
    onSuccess: invalidate,
  });
}

export function useDeleteDocumentFile(documentId: string) {
  const invalidate = useDocumentInvalidation(documentId);
  return useMutation({ mutationFn: documentsApi.deleteDocumentFile, onSuccess: invalidate });
}

export function useMakeDocumentFileMain(documentId: string) {
  const invalidate = useDocumentInvalidation(documentId);
  return useMutation({ mutationFn: documentsApi.makeDocumentFileMain, onSuccess: invalidate });
}

export function useDownloadDocumentFile() {
  return useMutation({
    mutationFn: ({ fileId, filename }: { fileId: string; filename: string }) =>
      documentsApi.downloadDocumentFile(fileId, filename),
  });
}
