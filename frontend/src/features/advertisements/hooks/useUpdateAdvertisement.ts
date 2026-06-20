import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { advertisementApi } from "@/features/advertisements/api/advertisement.api";
import { ADVERTISEMENT_QUERY_KEYS } from "./useAdvertisements";
import type { UpdateAdvertisementPayload } from "@/features/advertisements/types/advertisement.types";

export function useUpdateAdvertisement(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAdvertisementPayload) =>
      advertisementApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADVERTISEMENT_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ADVERTISEMENT_QUERY_KEYS.detail(id),
      });
      toast.success("Advertisement updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update advertisement");
    },
  });
}
