// Client-side SVG inspection utilities. Uses DOMParser — browser only.

export type CssVarUsage = {
  name: string
  role: string | null
}

export type TextNode = {
  tag: 'text' | 'tspan'
  id: string | null
  className: string | null
  content: string
}

export type NamedLayer = {
  tag: string
  id: string | null
  className: string | null
}

export type SvgInspectionResult = {
  cssVars: CssVarUsage[]
  textNodes: TextNode[]
  namedLayers: NamedLayer[]
}

const PALETTE_ROLES: Record<string, string> = {
  '--iv-bg':   'background',
  '--iv-surf': 'surface',
  '--iv-acc':  'accent',
  '--iv-tp':   'textPrimary',
  '--iv-ts':   'textSecondary',
  '--iv-mut':  'muted',
}

export function parseSvgAttributes(svgText: string): SvgInspectionResult {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')

  // --- CSS vars ---
  const varMatches = [...svgText.matchAll(/var\((--[^),\s]+)/g)]
  const seen = new Set<string>()
  const cssVars: CssVarUsage[] = []
  for (const m of varMatches) {
    const name = m[1]
    if (seen.has(name)) continue
    seen.add(name)
    cssVars.push({ name, role: PALETTE_ROLES[name] ?? null })
  }

  // --- Text nodes ---
  const textNodes: TextNode[] = []
  doc.querySelectorAll('text, tspan').forEach((el) => {
    const directText = [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(' ')
    if (!directText) return
    textNodes.push({
      tag: el.tagName.toLowerCase() as 'text' | 'tspan',
      id: el.getAttribute('id'),
      className: el.getAttribute('class'),
      content: directText,
    })
  })

  // --- Named layers ---
  const namedLayers: NamedLayer[] = []
  doc.querySelectorAll('[id], [class]').forEach((el) => {
    const id = el.getAttribute('id')
    const className = el.getAttribute('class')
    // Skip the root <svg> element itself
    if (el.tagName.toLowerCase() === 'svg') return
    namedLayers.push({ tag: el.tagName.toLowerCase(), id, className })
  })

  return { cssVars, textNodes, namedLayers }
}
