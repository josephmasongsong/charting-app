import * as React from "react"

import { cn } from "@/lib/utils"

function AvatarTile({
  className,
  initials,
  size = 56,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  initials: string
  /** Square edge length in px; the initials scale with it. */
  size?: number
}) {
  return (
    <div
      data-slot="avatar-tile"
      className={cn(
        "grid shrink-0 place-items-center rounded-(--radius-avatar) bg-(--action-primary) font-bold text-(--text-on-chrome)",
        className
      )}
      style={{ width: size, height: size, fontSize: size / 3.1, ...style }}
      {...props}
    >
      {initials}
    </div>
  )
}

export { AvatarTile }
