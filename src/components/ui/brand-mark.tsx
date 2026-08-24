import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

function BrandMark({
  className,
  size = 30,
  ...props
}: Omit<React.ComponentProps<typeof Image>, "src" | "alt" | "width" | "height"> & {
  size?: number
}) {
  return (
    <Image
      data-slot="brand-mark"
      src="/bch-logo.png"
      alt=""
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      {...props}
    />
  )
}

export { BrandMark }
