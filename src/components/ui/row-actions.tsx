"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type RowAction = {
  label: string;
  /** Renders the action as a link instead of a button. */
  href?: string;
  onSelect?: () => void;
  /** Pushed to the end, after a wider gap, in danger red. */
  danger?: boolean;
};

const actionClass =
  "cursor-pointer rounded-(--radius-control) px-1.5 py-1 text-[13.5px] font-semibold whitespace-nowrap text-(--action-primary) hover:bg-(--action-selected) hover:underline";
const dangerActionClass =
  "cursor-pointer rounded-(--radius-control) px-1.5 py-1 text-[13.5px] font-semibold whitespace-nowrap text-(--danger) hover:bg-(--danger-surface) hover:underline";

/**
 * The row-level actions for a list item, shown inline as words.
 *
 * Every action is one click, with no menu to open first and no bare glyph to
 * decode. They stay on the item's own line at every width — the reason this is
 * one component rather than loose buttons is that the destructive action is
 * always last and always separated, so Delete never sits flush against Edit.
 */
function RowActions({
  label,
  actions,
  className,
}: {
  /** Accessible name for the group, e.g. `Actions for Cooling Kit`. */
  label: string;
  actions: RowAction[];
  className?: string;
}) {
  const safe = actions.filter(action => !action.danger);
  const dangerous = actions.filter(action => action.danger);

  const render = (action: RowAction) => {
    const itemClass = action.danger ? dangerActionClass : actionClass;
    const name = `${action.label} ${label.replace(/^Actions for /, "")}`.trim();

    if (action.href) {
      return (
        <Link
          key={action.label}
          href={action.href}
          aria-label={name}
          className={itemClass}
        >
          {action.label}
        </Link>
      );
    }
    return (
      <button
        key={action.label}
        type="button"
        onClick={action.onSelect}
        aria-label={name}
        className={itemClass}
      >
        {action.label}
      </button>
    );
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex items-center gap-0.5", className)}
    >
      {safe.map(render)}
      {dangerous.length > 0 && safe.length > 0 && (
        <span aria-hidden="true" className="w-2" />
      )}
      {dangerous.map(render)}
    </div>
  );
}

export { RowActions };
export type { RowAction };
