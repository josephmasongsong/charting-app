import * as React from "react"
import { MessageSquareIcon, PhoneIcon } from "lucide-react"

import { AvatarTile } from "@/components/ui/avatar-tile"
import { cn } from "@/lib/utils"

type Person = {
  initials: string
  name: React.ReactNode
  title: React.ReactNode
  dept: React.ReactNode
  branch: React.ReactNode
  email: string
  phone: React.ReactNode
}

function StaffRow({
  className,
  person,
  selected = false,
  striped = false,
  ...props
}: React.ComponentProps<"div"> & {
  person: Person
  selected?: boolean
  striped?: boolean
}) {
  return (
    <div
      data-slot="staff-row"
      data-selected={selected ? "true" : undefined}
      className={cn(
        "grid grid-cols-[72px_1.1fr_1.4fr_1.4fr_.8fr_70px] items-center gap-3 border-b border-(--bch-gray-200) px-4 py-3 text-[14.5px]",
        selected
          ? "bg-(--action-selected) shadow-[inset_4px_0_0_var(--action-primary)]"
          : striped
            ? "bg-(--surface-muted)"
            : "bg-(--surface-card)",
        className
      )}
      {...props}
    >
      <AvatarTile initials={person.initials} />
      <div>
        <b>{person.name}</b>
        <div className="text-[13.5px] text-(--text-muted)">{person.title}</div>
      </div>
      <div>
        {person.dept}
        <div className="text-[13.5px] text-(--text-muted)">{person.branch}</div>
      </div>
      <a href={`mailto:${person.email}`} className="text-(--action-primary)">
        {person.email}
      </a>
      <div className="text-[13.5px] text-(--text-muted)">{person.phone}</div>
      <div className="flex gap-2.5 text-(--action-primary)">
        <PhoneIcon className="size-[17px]" />
        <MessageSquareIcon className="size-[17px]" />
      </div>
    </div>
  )
}

export { StaffRow }
export type { Person }
