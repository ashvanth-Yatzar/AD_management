export type MediaType = "image_upload" | "url";

export type AdvertisementStatus =
  | "draft"
  | "active"
  | "scheduled"
  | "paused"
  | "expired";

export type PlanType =
  | "1_week"
  | "2_weeks"
  | "1_month"
  | "3_months"
  | "6_months";

export interface Advertisement {
  id: string;
  title: string;
  content: string;
  media_type: MediaType;
  image_path: string | null;
  media_url: string | null;
  status: AdvertisementStatus;
  plan_type: PlanType;
  start_date: string;
  end_date: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvertisementListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: AdvertisementStatus | "";
  media_type?: MediaType | "";
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateAdvertisementPayload {
  title: string;
  content: string;
  media_type: MediaType;
  status: AdvertisementStatus;
  plan_type: PlanType;
  start_date: string;
  media_url?: string;
  image?: File;
}

export interface UpdateAdvertisementPayload {
  title?: string;
  content?: string;
  media_type?: MediaType;
  status?: AdvertisementStatus;
  plan_type?: PlanType;
  start_date?: string;
  media_url?: string;
  image?: File;
}

export type ExportFormat = "excel" | "pdf" | "word";
export type ExportScope = "current_page" | "all_records";
