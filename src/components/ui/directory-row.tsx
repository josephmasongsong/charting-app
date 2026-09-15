"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DirectoryMeta = {
  label: React.ReactNode;
  value: React.ReactNode;
};

/**
 * A responsive list row for the admin directories.
 *
 * The tables these replaced set a fixed `min-w-[720px]` inside an
 * `overflow-x-auto`, so on a phone the row actions sat off-screen and had to be
 * scrolled to. Two rules follow from that:
 *
 * - no minimum width, so nothing ever scrolls sideways;
 * - the actions stay on the item's own line at every width. On a phone that is
 *   a two-column grid (name takes the space, actions hug the right) with the
 *   meta values wrapping onto a second line beneath both; from `md` up it is a
 *   single flex line. `order` does the rearranging, so the DOM holds one copy
 *   of everything — no duplicated markup for screen readers to read twice.
 *
 * Meta carries its own labels because there is no header row to read them from.
 */
function DirectoryRow({
  leading,
  title,
  sub,
  meta = [],
  actions,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  /** Omitted from the div props above so a node can be passed, not just
   * the string the HTML title attribute allows. */
  title: React.ReactNode;
  /** Optional visual anchor (icon tile, avatar) before the title. */
  leading?: React.ReactNode;
  /** Optional second line under the title. */
  sub?: React.ReactNode;
  /** Labelled values shown beside the title (below it on phones). */
  meta?: DirectoryMeta[];
  actions?: React.ReactNode;
}) {
  return (
    <div
      data-slot="directory-row"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-(--bch-gray-200) px-4 py-3.5 text-[14.5px] last:border-b-0 even:bg-(--surface-muted) hover:bg-(--action-selected)",
        "md:flex md:items-center md:gap-6",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3 md:order-1 md:flex-1">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="min-w-0">
          <div className="font-semibold break-words">{title}</div>
          {sub && (
            <div className="mt-0.5 text-[13.5px] break-words text-(--text-muted)">
              {sub}
            </div>
          )}
        </div>
      </div>

      {/* Right of the name on phones so it never drops below it. */}
      {actions && (
        <div className="justify-self-end md:order-3 md:shrink-0">{actions}</div>
      )}

      {/* Second grid line on phones, spanning both columns. */}
      {meta.length > 0 && (
        <div className="col-span-2 flex flex-wrap items-start gap-x-8 gap-y-2 md:order-2 md:col-auto md:shrink-0">
          {meta.map((item, i) => (
            <div key={i} className="min-w-0">
              <div className="text-[11.5px] font-bold tracking-[.6px] text-(--text-muted) uppercase">
                {item.label}
              </div>
              <div className="mt-0.5 tabular-nums">{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { DirectoryRow };
export type { DirectoryMeta };
