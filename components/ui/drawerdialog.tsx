"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface DrawerDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  contentClassName?: string
}

export function DrawerDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
}: DrawerDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className={cn("sm:max-w-[425px]", contentClassName)}>
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {children}
          {footer && (
            <div className="flex justify-end gap-2 pt-4">
              {footer}
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className={className}>
        <DrawerHeader className="text-left">
          {title && <DrawerTitle>{title}</DrawerTitle>}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        {children}
        {footer && (
          <DrawerFooter className="pt-2">
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// Close 컴포넌트들을 export
export { DrawerClose, DialogClose }

// 범용 Close 컴포넌트
export function DrawerDialogClose({ children, ...props }: React.ComponentPropsWithoutRef<typeof Button>) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  if (isDesktop) {
    return (
      <DialogClose asChild>
        <Button {...props}>{children}</Button>
      </DialogClose>
    )
  }
  
  return (
    <DrawerClose asChild>
      <Button {...props}>{children}</Button>
    </DrawerClose>
  )
}

// 기존 컴포넌트와의 호환성을 위한 별칭
export function DrawerDialogDemo() {
  return (
    <DrawerDialog
      trigger={<Button variant="outline">Edit Profile</Button>}
      title="Edit profile"
      description="Make changes to your profile here. Click save when you're done."
      footer={
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      }
    />
  )
}
