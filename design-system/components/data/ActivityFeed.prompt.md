Sidebar activity widget: card header with optional context meta, then category groups (uppercase label + teal icon) of timestamped rows. Rows with `initials` show an AvatarTile; rows without show a tone-tinted icon badge (notifications, deadlines). Each group reveals `initialCount` rows and grows by `pageSize` per "Load more"; when every group is exhausted the footer reads the `emptyLabel`. `icon` fields take icon names from the design system icon set.

```jsx
<ActivityFeed title="Activity" meta="Provider: Hacienda MT" pageSize={2} initialCount={2}
  groups={[
    { label: "Documents", icon: "Upload", items: [
      { initials: "MC", actor: "Maria Chen", action: "uploaded", target: "Q2 Financial Statement.pdf", time: "10 minutes ago" },
    ]},
    { label: "Notifications", icon: "Bell", items: [
      { action: "Document submission due in 5 days for", target: "Operational Review 2026", time: "Today, 8:00 AM", tone: "warning" },
    ]},
  ]} />
```
