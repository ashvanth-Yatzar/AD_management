import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useCreateAdvertisement } from "@/features/advertisements/hooks/useCreateAdvertisement";
import type { AdvertisementFormValues } from "@/features/advertisements/schema/advertisement.schema";

import { AdvertisementForm } from "@/features/advertisements/components/AdvertisementForm";
import { Button } from "@/shared/components/ui/Button";

export function AdvertisementCreatePage() {
  const navigate = useNavigate();
  const { mutate: createAd, isPending } = useCreateAdvertisement();

  const handleSubmit = (values: AdvertisementFormValues) => {
    createAd(
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
            Create Advertisement
          </h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details to create a new advertisement campaign
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <AdvertisementForm
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          submitLabel="Create Advertisement"
          onCancel={() => navigate("/advertisements")}
        />
      </div>
    </div>
  );
}
