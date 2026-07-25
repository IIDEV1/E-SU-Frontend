import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi, type DocumentsParams } from "@/services/endpoints/documents.api";
import type { Document } from "@/types";

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (params: DocumentsParams) => [...documentKeys.lists(), params] as const,
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

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Document>) => documentsApi.createDocument(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  });
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Document>) => documentsApi.updateDocument(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.all });
      void queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.archiveDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  });
}
