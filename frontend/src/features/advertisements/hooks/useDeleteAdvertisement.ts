import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { advertisementApi } from "@/features/advertisements/api/advertisement.api";
import { ADVERTISEMENT_QUERY_KEYS } from "./useAdvertisements";

export function useDeleteAdvertisement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advertisementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADVERTISEMENT_QUERY_KEYS.all,
      });
      toast.success("Advertisement deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete advertisement");
    },
  });
}
