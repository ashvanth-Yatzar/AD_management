import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { PLAN_OPTIONS } from "@/features/advertisements/utils/advertisement.utils";
import type { PlanType } from "@/features/advertisements/types/advertisement.types";

interface PlanSelectorProps {
  value: PlanType | undefined;
  onChange: (value: PlanType) => void;
  disabled?: boolean;
  error?: boolean;
}

export function PlanSelector({
  value,
  onChange,
  disabled,
  error,
}: PlanSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as PlanType)}
      disabled={disabled}
    >
      <SelectTrigger
        className={error ? "border-destructive focus:ring-destructive" : ""}
        aria-label="Select plan"
      >
        <SelectValue placeholder="Select plan" />
      </SelectTrigger>
      <SelectContent>
        {PLAN_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
