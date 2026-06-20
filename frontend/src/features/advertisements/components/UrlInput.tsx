import { Globe, Image, Video } from "lucide-react";
import { Input } from "@/shared/components/ui/Input";
import { cn } from "@/shared/utils/cn";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

function detectUrlType(url: string) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/.test(lower)) return "image";
  if (/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/.test(lower)) return "video";
  return "website";
}

const URL_TYPE_ICONS = {
  image: Image,
  video: Video,
  website: Globe,
};

export function UrlInput({ value, onChange, error, disabled }: UrlInputProps) {
  const urlType = detectUrlType(value);
  const IconComponent = urlType ? URL_TYPE_ICONS[urlType] : null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="url"
          placeholder="https://example.com/image.jpg  or  https://example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "pr-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          aria-label="Media URL"
        />
        {IconComponent && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <IconComponent className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Preview */}
      {value && (urlType === "image") && (
        <div className="rounded-md border overflow-hidden bg-muted/30 p-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Preview</p>
          <img
            src={value}
            alt="URL preview"
            className="max-h-48 w-auto rounded object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {value && urlType === "video" && (
        <div className="rounded-md border overflow-hidden bg-muted/30 p-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Preview</p>
          <video
            src={value}
            controls
            className="max-h-48 w-full rounded"
          />
        </div>
      )}

      {value && urlType === "website" && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Globe className="h-3 w-3" />
          Open in new tab
        </a>
      )}
    </div>
  );
}
