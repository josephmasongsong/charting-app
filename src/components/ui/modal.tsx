"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function Modal({
  className,
  open,
  onClose,
  title,
  footer,
  center = false,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogContent>, "title"> & {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  footer?: React.ReactNode
  /** Centers body copy and footer actions — used for confirmation dialogs. */
  center?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        data-slot="modal"
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden rounded-(--radius-card) border-0 bg-(--surface-card) p-0 shadow-(--shadow-modal) sm:max-w-[560px]",
          className
        )}
        {...props}
      >
        <div
          data-slot="modal-header"
          className="flex items-center justify-between bg-(--surface-chrome) px-6 py-[18px] text-(--text-on-chrome)"
        >
          <DialogTitle
            className={cn(
              "text-[21px] leading-none font-bold",
              !title && "sr-only"
            )}
          >
            {title ?? "Dialog"}
          </DialogTitle>
          <DialogClose
            aria-label="Close"
            className="cursor-pointer opacity-90 transition-opacity hover:opacity-100"
          >
            <XIcon className="size-5" />
          </DialogClose>
        </div>
        <div
          data-slot="modal-body"
          className={cn("p-6 text-[15px]", center && "text-center")}
        >
          {children}
        </div>
        {footer && (
          <div
            data-slot="modal-footer"
            className={cn(
              "flex gap-3 px-6 pb-6",
              center ? "justify-center" : "justify-end"
            )}
          >
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { Modal }
