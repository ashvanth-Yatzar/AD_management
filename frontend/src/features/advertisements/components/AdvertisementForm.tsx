import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";

import {
  advertisementSchema,
  type AdvertisementFormValues,
} from "@/features/advertisements/schema/advertisement.schema";
import type { Advertisement } from "@/features/advertisements/types/advertisement.types";
import { calculateEndDate } from "@/shared/utils/date";

import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { RichTextEditor } from "@/shared/components/editor/RichTextEditor";
import { StatusSelector } from "./StatusSelector";
import { PlanSelector } from "./PlanSelector";
import { MediaUploader } from "./MediaUploader";
import { UrlInput } from "./UrlInput";
import { Loader } from "@/shared/components/feedback/Loader";
import { cn } from "@/shared/utils/cn";
import { getImageUrl } from "@/features/advertisements/utils/advertisement.utils";

interface AdvertisementFormProps {
  defaultValues?: Advertisement;
  onSubmit: (values: AdvertisementFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

function FormField({
  label,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AdvertisementForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save",
  onCancel,
}: AdvertisementFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdvertisementFormValues>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      media_type: defaultValues?.media_type ?? "image_upload",
      status: defaultValues?.status ?? "draft",
      plan_type: defaultValues?.plan_type ?? undefined,
      start_date: defaultValues?.start_date
        ? format(parseISO(defaultValues.start_date), "yyyy-MM-dd'T'HH:mm")
        : "",
      media_url: defaultValues?.media_url ?? "",
      image: null,
    },
  });

  const mediaType = watch("media_type");
  const startDate = watch("start_date");
  const planType = watch("plan_type");

  // Auto-calculate end date
  const endDate = (() => {
    if (!startDate || !planType) return null;
    try {
      return calculateEndDate(new Date(startDate), planType);
    } catch {
      return null;
    }
  })();

  // Reset image/url when media type changes
  useEffect(() => {
    if (mediaType === "url") {
      setValue("image", null);
    } else {
      setValue("media_url", "");
    }
  }, [mediaType, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Title */}
      <FormField label="Advertisement Title" error={errors.title?.message} required>
        <Input
          {...register("title")}
          placeholder="Enter advertisement title"
          maxLength={200}
          className={cn(errors.title && "border-destructive")}
          aria-required="true"
        />
      </FormField>

      {/* Content */}
      <FormField label="Advertisement Content" error={errors.content?.message} required>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              error={!!errors.content}
            />
          )}
        />
      </FormField>

      {/* Media Type */}
      <FormField label="Media Type" error={errors.media_type?.message} required>
        <div className="flex gap-4">
          {(["image_upload", "url"] as const).map((type) => (
            <label
              key={type}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-colors",
                mediaType === type
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-input hover:bg-muted/50"
              )}
            >
              <Controller
                name="media_type"
                control={control}
                render={({ field }) => (
                  <input
                    type="radio"
                    value={type}
                    checked={field.value === type}
                    onChange={() => field.onChange(type)}
                    className="sr-only"
                  />
                )}
              />
              {type === "image_upload" ? "Image Upload" : "URL"}
            </label>
          ))}
        </div>
      </FormField>

      {/* Conditional media fields */}
      {mediaType === "image_upload" && (
        <FormField label="Upload Image" error={errors.image?.message} required>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <MediaUploader
                value={field.value ?? null}
                onChange={field.onChange}
                error={errors.image?.message}
                existingImageUrl={getImageUrl(defaultValues?.image_path)}
              />
            )}
          />
        </FormField>
      )}

      {mediaType === "url" && (
        <FormField label="Media URL" error={errors.media_url?.message} required>
          <Controller
            name="media_url"
            control={control}
            render={({ field }) => (
              <UrlInput
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.media_url?.message}
              />
            )}
          />
        </FormField>
      )}

      {/* Status + Plan in a grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Status" error={errors.status?.message} required>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <StatusSelector
                value={field.value}
                onChange={field.onChange}
                error={!!errors.status}
              />
            )}
          />
        </FormField>

        <FormField label="Plan" error={errors.plan_type?.message} required>
          <Controller
            name="plan_type"
            control={control}
            render={({ field }) => (
              <PlanSelector
                value={field.value}
                onChange={field.onChange}
                error={!!errors.plan_type}
              />
            )}
          />
        </FormField>
      </div>

      {/* Date fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Start Date"
          error={errors.start_date?.message}
          required
        >
          <Input
            type="datetime-local"
            {...register("start_date")}
            className={cn(errors.start_date && "border-destructive")}
            aria-required="true"
          />
        </FormField>

        <FormField
          label="End Date"
          hint="Auto-calculated from Start Date and Plan"
        >
          <Input
            type="text"
            readOnly
            value={
              endDate
                ? format(endDate, "MMM d, yyyy HH:mm")
                : "Select start date and plan"
            }
            className="bg-muted/50 text-muted-foreground cursor-not-allowed"
            aria-label="End date (auto-calculated)"
          />
        </FormField>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader size="sm" />
              Saving…
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
