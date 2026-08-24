import * as React from "react"

import { cn } from "@/lib/utils"

function AppFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="app-footer"
      className={cn(
        "bg-(--surface-chrome) p-6 text-center text-[14.5px] text-(--text-on-chrome)",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          Copyright © {new Date().getFullYear()}{" "}
          <a href="https://www.bchousing.org" className="text-(--text-on-chrome)">
            BC Housing
          </a>
          . All rights reserved.
        </>
      )}
    </footer>
  )
}

export { AppFooter }
