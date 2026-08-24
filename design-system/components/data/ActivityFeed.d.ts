export interface ActivityType {
  /** Short uppercase category label, e.g. "Event". */
  label: string;
  /** Icon name from the design system icon set. */
  icon?: string;
  /** Drives the chip's tint. */
  tone?: "warning" | "danger" | "info" | "success" | "teal" | "neutral";
}
export interface ActivityItem {
  /** Actor initials — renders an AvatarTile. Omit to render a tone-tinted icon badge instead. */
  initials?: string;
  actor?: string;
  action: string;
  target?: string;
  time: string;
  /** Category chip shown ahead of the sentence — use in flat chronological feeds. */
  type?: ActivityType;
  /** Icon name from the design system icon set (used when `initials` is absent). */
  icon?: string;
  tone?: "warning" | "danger" | "info" | "success";
  /** Makes the row a link (e.g. to the event's detail page). */
  href?: string;
}
export interface ActivityGroup {
  label: string;
  /** Icon name from the design system icon set. */
  icon?: string;
  items: ActivityItem[];
}
export interface ActivityFeedProps {
  title?: string;
  meta?: string;
  /** Grouped mode: rows bucketed under category headers. */
  groups?: ActivityGroup[];
  /** Flat mode: one chronological list. Takes precedence over `groups`; pair with `item.type` chips. */
  items?: ActivityItem[];
  /** Rows revealed before "Load more" (per group in grouped mode). */
  initialCount?: number;
  /** Rows added per "Load more" click. */
  pageSize?: number;
  avatarSize?: number;
  emptyLabel?: string;
  width?: number | string;
  onLoadMore?: (visible: number) => void;
}
export function ActivityFeed(props: ActivityFeedProps): JSX.Element;
