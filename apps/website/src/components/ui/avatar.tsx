import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ref,
  ...props
}: AvatarProps & React.RefAttributes<HTMLSpanElement>) {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ref,
  ...props
}: AvatarImageProps & React.RefAttributes<HTMLImageElement>) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ref,
  ...props
}: AvatarFallbackProps & React.RefAttributes<HTMLSpanElement>) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
