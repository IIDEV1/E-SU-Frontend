import { documents } from "@/mocks/data";
import type { Document, DocumentStatus, PaginatedResponse } from "@/types";

export interface DocumentsParams {
  status?: DocumentStatus;
  owner?: "me";
  query?: string;
  page?: number;
  pageSize?: number;
}

export const documentsApi = {
  async getDocuments(params: DocumentsParams = {}): Promise<PaginatedResponse<Document>> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 8;
    const normalizedQuery = params.query?.toLowerCase().trim();
    const filtered = documents.filter((document) => {
      const matchesStatus = params.status ? document.status === params.status : true;
      const matchesOwner = params.owner ? document.author.id === "u-1" : true;
      const matchesQuery = normalizedQuery
        ? [document.title, document.number, document.category.name].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          )
        : true;

      return matchesStatus && matchesOwner && matchesQuery;
    });

    return {
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: filtered.length,
    };
  },
  async getDocument(id: string): Promise<Document> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const document = documents.find((item) => item.id === id);

    if (!document) {
      throw new Error("Документ не найден.");
    }

    return document;
  },
  async createDocument(payload: Partial<Document>): Promise<Document> {
    return { ...documents[0], ...payload, id: crypto.randomUUID(), number: "ESU-NEW" };
  },
  async updateDocument(id: string, payload: Partial<Document>): Promise<Document> {
    const document = await this.getDocument(id);
    return { ...document, ...payload };
  },
  async archiveDocument(id: string): Promise<Document> {
    const document = await this.getDocument(id);
    return { ...document, status: "archived" };
  },
};
