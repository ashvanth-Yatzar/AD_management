import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useAdvertisement } from "@/features/advertisements/hooks/useAdvertisements";
import { useUpdateAdvertisement } from "@/features/advertisements/hooks/useUpdateAdvertisement";
import type { AdvertisementFormValues } from "@/features/advertisements/schema/advertisement.schema";

import { AdvertisementForm } from "@/features/advertisements/components/AdvertisementForm";
import { Button } from "@/shared/components/ui/Button";
import { PageLoader } from "@/shared/components/feedback/Loader";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

export function AdvertisementEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useAdvertisement(id);
  const { mutate: updateAd, isPending } = useUpdateAdvertisement(id!);

  const advertisement = data?.data;

  const handleSubmit = (values: AdvertisementFormValues) => {
    updateAd(
      {
        title: values.title,
        content: values.content,
        media_type: values.media_type,
        status: values.status,
        plan_type: values.plan_type,
        start_date: values.start_date,
        media_url: values.media_url ?? undefined,
        image: values.image ?? undefined,
      },
      {
        onSuccess: () => navigate("/advertisements"),
      }
    );
  };

  if (isLoading) return <PageLoader />;

  if (isError || !advertisement) {
    return (
      <EmptyState
        title="Advertisement not found"
        description="The advertisement you're looking for doesn't exist or has been deleted."
        action={{
          label: "Back to list",
          onClick: () => navigate("/advertisements"),
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/advertisements")}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Edit Advertisement
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {advertisement.title}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <AdvertisementForm
          defaultValues={advertisement}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Save Changes"
          onCancel={() => navigate("/advertisements")}
        />
      </div>
    </div>
  );
}
