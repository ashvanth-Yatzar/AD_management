import { z } from "zod";

export const advertisementSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be at most 200 characters"),

    content: z
      .string()
      .min(1, "Content is required")
      .refine(
        (val) => val.replace(/<[^>]*>/g, "").trim().length > 0,
        "Content cannot be empty"
      ),

    media_type: z.enum(["image_upload", "url"], {
      required_error: "Media type is required",
    }),

    image: z
      .instanceof(File)
      .optional()
      .nullable()
      .refine(
        (file) => !file || file.size <= 10 * 1024 * 1024,
        "File must be less than 10MB"
      )
      .refine(
        (file) =>
          !file ||
          ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
            file.type
          ),
        "Only JPG, PNG, and WebP images are allowed"
      ),

    media_url: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          !val ||
          val === "" ||
          val.startsWith("http://") ||
          val.startsWith("https://"),
        "Must be a valid HTTP/HTTPS URL"
      ),

    status: z.enum(["draft", "active", "scheduled", "paused", "expired"], {
      required_error: "Status is required",
    }),

    plan_type: z.enum(
      ["1_week", "2_weeks", "1_month", "3_months", "6_months"],
      { required_error: "Plan is required" }
    ),

    start_date: z.string().min(1, "Start date is required"),
  })
  .superRefine((data, ctx) => {
    if (data.media_type === "image_upload" && !data.image) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please upload an image",
        path: ["image"],
      });
    }
    if (data.media_type === "url" && !data.media_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL is required when media type is URL",
        path: ["media_url"],
      });
    }
  });

export type AdvertisementFormValues = z.infer<typeof advertisementSchema>;
