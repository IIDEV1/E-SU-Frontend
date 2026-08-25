export interface ApiEnvelope<T> {
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[] | string>;
  };
}

export interface ApiPagination<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AppApiError {
  status?: number;
  code: string;
  message: string;
  details?: Record<string, string[] | string>;
}
