'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Public IDs of the two slots in the global Header. Pages portal their
// page-specific content (status pill, action buttons) into these so the
// Header stays generic and pages keep ownership of their CTAs.
const BADGE_SLOT_ID = 'page-header-badge'
const ACTIONS_SLOT_ID = 'page-header-actions'

function useSlotElement(id: string): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setEl(document.getElementById(id))
    // Re-resolve on mount only — Header's slot divs live in a stable parent
    // (the admin layout) for the lifetime of the route group, so we don't
    // need to watch for element replacement.
  }, [id])
  return el
}

/**
 * Render its children into the admin Header's badge slot (next to the page
 * title). Renders nothing on first paint while the portal target resolves;
 * the badge appears once the layout has mounted.
 */
export function HeaderBadgeSlot({ children }: { children: ReactNode }) {
  const target = useSlotElement(BADGE_SLOT_ID)
  if (!target) return null
  return createPortal(<>{children}</>, target)
}

/**
 * Render its children into the admin Header's right-rail action slot, before
 * the global help / bell / avatar icons.
 */
export function HeaderActionsSlot({ children }: { children: ReactNode }) {
  const target = useSlotElement(ACTIONS_SLOT_ID)
  if (!target) return null
  return createPortal(<>{children}</>, target)
}
