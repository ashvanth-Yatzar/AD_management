import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// ── Request interceptor ────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Attach JWT when auth is implemented
    // const token = localStorage.getItem("access_token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: { message?: string } }>) => {
    const message =
      error.response?.data?.error?.message ??
      error.message ??
      "An unexpected error occurred";

    if (error.response?.status === 401) {
      // Redirect to login when auth is implemented
      toast.error("Session expired. Please log in again.");
    } else if (error.response?.status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(
      new Error(message)
    );
  }
);

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};
