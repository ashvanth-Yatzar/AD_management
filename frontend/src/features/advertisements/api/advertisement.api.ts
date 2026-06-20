import { apiClient, ApiResponse, PaginatedData } from "@/shared/services/axios";
import type {
  Advertisement,
  AdvertisementListParams,
  CreateAdvertisementPayload,
  ExportFormat,
  UpdateAdvertisementPayload,
} from "@/features/advertisements/types/advertisement.types";

const BASE = "/advertisements/";

// ── Helpers ────────────────────────────────────────────────────────────────

function buildFormData(
  payload: CreateAdvertisementPayload | UpdateAdvertisementPayload
): FormData {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "image" && value instanceof File) {
      fd.append("image", value);
    } else {
      fd.append(key === "status" ? "status" : key, String(value));
    }
  });

  return fd;
}

// ── API Functions ──────────────────────────────────────────────────────────

export const advertisementApi = {
  list: async (
    params: AdvertisementListParams = {}
  ): Promise<ApiResponse<PaginatedData<Advertisement>>> => {
    const cleanParams: Record<string, string | number> = {};

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) {
        cleanParams[k] = v as string | number;
      }
    });

    const res = await apiClient.get<
      ApiResponse<PaginatedData<Advertisement>>
    >(BASE, {
      params: cleanParams,
    });

    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Advertisement>> => {
    const res = await apiClient.get<ApiResponse<Advertisement>>(
      `${BASE}${id}`
    );

    return res.data;
  },

  create: async (
    payload: CreateAdvertisementPayload
  ): Promise<ApiResponse<Advertisement>> => {
    const fd = buildFormData(payload);

    const res = await apiClient.post<ApiResponse<Advertisement>>(
      BASE,
      fd,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  update: async (
    id: string,
    payload: UpdateAdvertisementPayload
  ): Promise<ApiResponse<Advertisement>> => {
    const fd = buildFormData(payload);

    const res = await apiClient.put<ApiResponse<Advertisement>>(
      `${BASE}${id}`,
      fd,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `${BASE}${id}`
    );

    return res.data;
  },

  exportFile: (
    format: ExportFormat,
    ids?: string[]
  ): string => {
    const base = `/api/v1${BASE}export/${
      format === "excel" ? "excel" : format
    }`;

    if (ids && ids.length > 0) {
      return `${base}?ids=${ids.join(",")}`;
    }

    return base;
  },
};