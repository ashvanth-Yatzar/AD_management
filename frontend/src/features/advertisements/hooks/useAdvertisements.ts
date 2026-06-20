import { useQuery } from "@tanstack/react-query";
import { advertisementApi } from "@/features/advertisements/api/advertisement.api";
import type { AdvertisementListParams } from "@/features/advertisements/types/advertisement.types";

export const ADVERTISEMENT_QUERY_KEYS = {
  all: ["advertisements"] as const,
  list: (params: AdvertisementListParams) =>
    ["advertisements", "list", params] as const,
  detail: (id: string) => ["advertisements", "detail", id] as const,
};

export function useAdvertisements(params: AdvertisementListParams = {}) {
  return useQuery({
    queryKey: ADVERTISEMENT_QUERY_KEYS.list(params),
    queryFn: () => advertisementApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdvertisement(id: string | undefined) {
  return useQuery({
    queryKey: ADVERTISEMENT_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => advertisementApi.getById(id!),
    enabled: !!id,
  });
}
