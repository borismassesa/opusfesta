"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

type AccordionType = "single" | "multiple"
type AccordionValue = string | string[] | undefined

type AccordionContextValue = {
  type: AccordionType
  collapsible: boolean
  value: AccordionValue
  toggleItem: (itemValue: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

type AccordionItemContextValue = {
  value: string
  isOpen: boolean
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null)

const useAccordionContext = () => {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("Accordion components must be used within Accordion")
  }
  return context
}

const useAccordionItemContext = () => {
  const context = React.useContext(AccordionItemContext)
  if (!context) {
    throw new Error("AccordionTrigger/AccordionContent must be used within AccordionItem")
  }
  return context
}

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  type?: AccordionType
  collapsible?: boolean
  value?: AccordionValue
  defaultValue?: AccordionValue
  onValueChange?: (value: AccordionValue) => void
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = "single",
      collapsible = false,
      value,
      defaultValue,
      onValueChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<AccordionValue>(() => {
      if (defaultValue !== undefined) {
        return defaultValue
      }
      return type === "multiple" ? [] : undefined
    })

    const currentValue = value !== undefined ? value : internalValue

    const setValue = (nextValue: AccordionValue) => {
      if (value === undefined) {
        setInternalValue(nextValue)
      }
      onValueChange?.(nextValue)
    }

    const toggleItem = (itemValue: string) => {
      if (type === "multiple") {
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const isOpen = currentArray.includes(itemValue)
        const nextArray = isOpen
          ? currentArray.filter(entry => entry !== itemValue)
          : [...currentArray, itemValue]
        setValue(nextArray)
        return
      }

      const currentSingle = Array.isArray(currentValue) ? currentValue[0] : currentValue
      const isOpen = currentSingle === itemValue
      if (isOpen) {
        if (collapsible) {
          setValue(undefined)
        }
        return
      }

      setValue(itemValue)
    }

    const contextValue = React.useMemo<AccordionContextValue>(
      () => ({
        type,
        collapsible,
        value: currentValue,
        toggleItem
      }),
      [type, collapsible, currentValue]
    )

    return (
      <AccordionContext.Provider value={contextValue}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { type, value: rootValue } = useAccordionContext()
    const isOpen =
      type === "multiple"
        ? Array.isArray(rootValue) && rootValue.includes(value)
        : !Array.isArray(rootValue) && rootValue === value

    const itemContextValue = React.useMemo<AccordionItemContextValue>(
      () => ({
        value,
        isOpen
      }),
      [value, isOpen]
    )

    return (
      <AccordionItemContext.Provider value={itemContextValue}>
        <div
          ref={ref}
          data-state={isOpen ? "open" : "closed"}
          className={cn("border-b", className)}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { toggleItem } = useAccordionContext()
  const { value, isOpen } = useAccordionItemContext()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      toggleItem(value)
    }
  }

  return (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        data-state={isOpen ? "open" : "closed"}
        aria-expanded={isOpen}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-sm font-medium text-left transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </button>
    </div>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useAccordionItemContext()

    return (
      <div
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
          !isOpen && "hidden",
          className
        )}
        {...props}
      >
        <div className="pb-4 pt-0">{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
