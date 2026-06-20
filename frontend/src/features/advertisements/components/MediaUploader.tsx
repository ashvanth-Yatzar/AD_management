import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/Button";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface MediaUploaderProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  existingImageUrl?: string | null;
  disabled?: boolean;
}

export function MediaUploader({
  value,
  onChange,
  error,
  existingImageUrl,
  disabled,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = value
    ? URL.createObjectURL(value)
    : existingImageUrl ?? null;

  const validateAndSet = useCallback(
    (file: File) => {
      setLocalError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setLocalError("Only JPG, PNG, and WebP images are allowed");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setLocalError(`File size must be less than ${MAX_SIZE_MB}MB`);
        return;
      }
      onChange(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    onChange(null);
    setLocalError(null);
  };

  const displayError = localError || error;

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border bg-muted/30">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-h-56 object-contain"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {value && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-3 py-1.5">
              {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            displayError && "border-destructive",
            disabled && "pointer-events-none opacity-50"
          )}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              inputRef.current?.click();
            }
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              Drag & drop or{" "}
              <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP — max {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileInput}
        disabled={disabled}
        aria-hidden
      />

      {displayError && (
        <p className="text-xs text-destructive">{displayError}</p>
      )}
    </div>
  );
}
