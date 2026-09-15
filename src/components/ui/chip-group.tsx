"use client";

import { cn } from "@/lib/utils";

export interface ChipOption {
  value: string;
  label: string;
}

/**
 * A single-select row of toggle chips. The markup matches the distribution-type
 * chips in SupplyDistributionForm, extracted so the referral form's two rows
 * and any later picker share one control instead of a third hand-rolled copy.
 */
export function ChipGroup({
  options,
  value,
  onChange,
  disabled = false,
  invalid = false,
  ariaLabel,
  className,
}: {
  options: readonly ChipOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer rounded-(--radius-control) border px-3.5 py-[7px] text-[14.5px]",
              selected
                ? "border-(--action-primary) bg-(--action-selected) text-(--action-primary)"
                : "border-(--border-default) bg-(--surface-card) text-(--text-body) hover:border-(--action-primary) hover:text-(--action-primary)",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
