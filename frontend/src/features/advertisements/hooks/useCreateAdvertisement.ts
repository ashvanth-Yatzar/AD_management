import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { advertisementApi } from "@/features/advertisements/api/advertisement.api";
import { ADVERTISEMENT_QUERY_KEYS } from "./useAdvertisements";
import type { CreateAdvertisementPayload } from "@/features/advertisements/types/advertisement.types";

export function useCreateAdvertisement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdvertisementPayload) =>
      advertisementApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADVERTISEMENT_QUERY_KEYS.all,
      });
      toast.success("Advertisement created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to create advertisement");
    },
  });
}
