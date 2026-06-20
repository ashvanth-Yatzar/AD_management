import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { STATUS_OPTIONS } from "@/features/advertisements/utils/advertisement.utils";
import type { AdvertisementStatus } from "@/features/advertisements/types/advertisement.types";

interface StatusSelectorProps {
  value: AdvertisementStatus | undefined;
  onChange: (value: AdvertisementStatus) => void;
  disabled?: boolean;
  error?: boolean;
}

export function StatusSelector({
  value,
  onChange,
  disabled,
  error,
}: StatusSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as AdvertisementStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={error ? "border-destructive focus:ring-destructive" : ""}
        aria-label="Select status"
      >
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
