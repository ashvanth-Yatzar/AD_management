import type {
  AdvertisementStatus,
  MediaType,
  PlanType,
} from "@/features/advertisements/types/advertisement.types";

export const STATUS_LABELS: Record<AdvertisementStatus, string> = {
  draft: "Draft",
  active: "Active",
  scheduled: "Scheduled",
  paused: "Paused",
  expired: "Expired",
};

export const STATUS_VARIANTS: Record<
  AdvertisementStatus,
  "muted" | "success" | "info" | "warning" | "destructive"
> = {
  draft: "muted",
  active: "success",
  scheduled: "info",
  paused: "warning",
  expired: "destructive",
};

export const PLAN_LABELS: Record<PlanType, string> = {
  "1_week": "1 Week",
  "2_weeks": "2 Weeks",
  "1_month": "1 Month",
  "3_months": "3 Months",
  "6_months": "6 Months",
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  image_upload: "Image Upload",
  url: "URL",
};

export const STATUS_OPTIONS: { value: AdvertisementStatus; label: string }[] =
  (Object.entries(STATUS_LABELS) as [AdvertisementStatus, string][]).map(
    ([value, label]) => ({ value, label })
  );

export const PLAN_OPTIONS: { value: PlanType; label: string }[] = (
  Object.entries(PLAN_LABELS) as [PlanType, string][]
).map(([value, label]) => ({ value, label }));

export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `/${imagePath.replace(/^\//, "")}`;
}
