"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface EventListItem {
  id: string;
  title: string;
  /** DATE column, serialised YYYY-MM-DD. */
  eventDate: string;
  siteName?: string | null;
  eventIsYouthFocused?: boolean | null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// event_date is a DATE column serialised as YYYY-MM-DD; reading the parts
// avoids the previous-day shift that new Date('YYYY-MM-DD') gives in Pacific time.
function dateParts(dateStr: string) {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return { y, m: m - 1, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

function monthLabel(dateStr: string) {
  const { y, m } = dateParts(dateStr);
  return `${MONTHS[m]} ${y}`;
}

function fullDate(dateStr: string) {
  const { y, m, d } = dateParts(dateStr);
  return new Date(Date.UTC(y, m, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** The date square. Same hard-colour rounded tile as the site and user lists. */
function DateTile({ dateStr }: { dateStr: string }) {
  const { d, dow } = dateParts(dateStr);
  return (
    <div
      title={fullDate(dateStr)}
      className="grid size-11 shrink-0 place-items-center rounded-(--radius-avatar) bg-(--surface-chrome) text-center text-(--text-on-chrome)"
    >
      <div className="leading-none">
        <div className="text-[9.5px] font-bold tracking-[.6px] uppercase opacity-85">
          {DOW[dow]}
        </div>
        <div className="mt-[3px] text-[17px] leading-none font-bold">{d}</div>
      </div>
    </div>
  );
}

/**
 * The shared event list used by /events and /admin/events.
 *
 * Rows are bucketed by month under a separator styled like the dashboard
 * activity feed's Today/Yesterday rule. Grouping assumes the rows arrive in
 * date order, so pass `grouped={false}` when they are sorted by anything else
 * — otherwise the buckets would repeat and mislead.
 */
export function EventListRows({
  events,
  renderActions,
  grouped = true,
}: {
  events: EventListItem[];
  renderActions?: (event: EventListItem) => React.ReactNode;
  grouped?: boolean;
}) {
  const groups: Array<{ label: string; events: EventListItem[] }> = [];
  for (const event of events) {
    const label = grouped ? monthLabel(event.eventDate) : "";
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.events.push(event);
    } else {
      groups.push({ label, events: [event] });
    }
  }

  return (
    <>
      {groups.map(group => (
        <React.Fragment key={`${group.label}-${group.events[0]?.id}`}>
          {group.label && (
            <div className="flex items-center justify-between gap-3 border-b border-(--border-default) bg-(--surface-muted) px-4 py-2">
              <span className="text-[11.5px] font-bold tracking-[.03em] text-(--text-muted) uppercase">
                {group.label}
              </span>
              <span className="text-[11.5px] text-(--text-muted)">
                {group.events.length} shown
              </span>
            </div>
          )}
          {group.events.map(event => (
            <div
              key={event.id}
              className="flex items-center gap-3 border-b border-(--bch-gray-200) px-4 py-3 last:border-b-0 hover:bg-(--action-selected)"
            >
              <DateTile dateStr={event.eventDate} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14.5px] font-semibold text-(--text-body)">
                    {event.title}
                  </span>
                  {event.eventIsYouthFocused && (
                    <Badge
                      variant="secondary"
                      className="shrink-0 rounded-full border-transparent bg-(--action-selected) text-[11px] font-semibold text-(--action-primary)"
                    >
                      Youth
                    </Badge>
                  )}
                </div>
                {event.siteName && (
                  <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-(--text-muted)">
                    <MapPin className="size-[13px] shrink-0" />
                    <span className="truncate">{event.siteName}</span>
                  </div>
                )}
              </div>

              {renderActions && (
                <div className={cn("flex shrink-0 items-center gap-1")}>
                  {renderActions(event)}
                </div>
              )}
            </div>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}
