---
name: invitation-template
description: "Convert a designer-supplied SVG into a working invitation template. Use when the user says 'add template', 'convert SVG', 'new invitation design', or 'implement template'."
---

# Invitation Template Conversion

Given a designer SVG + palette JSON + metadata, produce a fully wired invitation template.

## Input expected

Ask the user for (or read from the handoff checklist):
- SVG file path (or content)
- Treatment name (kebab-case slug)
- Default font value
- Palette JSON array
- Fixed colours list (if any)
- Whether the design uses a photo background

---

## Step 1 — Read and parse the SVG

Open the SVG. Identify elements by `id` attribute matching these layer names:

| id | Maps to prop |
|---|---|
| `Background` | palette background fill |
| `Photo` | `{photoSrc}` — only present on photo templates |
| `Event_Title` | main event title — static (leave as-is) |
| `Intro` | intro paragraph — static (leave as-is) |
| `Names` | `{names}` |
| `Date` | `{date}` |
| `Time` | `{time}` |
| `Venue` | `{venue}` |
| `Reception` | `{receptionVenue}` / `{receptionTime}` |
| `Dress_code` | `{dressCode}` |
| `Rsvp` | `{rsvpContact}` |
| `Message` | `{message}` |
| `Message_attr` | `{messageAttr}` |
| `Decorative` | static — leave as-is |

---

## Step 2 — Create the component

File: `apps/opus_pass/src/components/guests/invitation-templates/TreatmentName.tsx`

Name it in PascalCase (e.g. `zanzibar-arch` → `ZanzibarArch`).

### Component skeleton

```tsx
import type { TemplateProps } from './_types'
import { resolveFont } from './_types'

export function ZanzibarArch({
  names, date, venue, palette, time, dressCode,
  rsvpContact, receptionVenue, receptionTime,
  message, messageAttr, fontStyle,
}: TemplateProps) {
  const vars = {
    '--iv-bg':  palette.background,
    '--iv-sur': palette.surface,
    '--iv-acc': palette.accent,
    '--iv-tp':  palette.textPrimary,
    '--iv-ts':  palette.textSecondary,
    '--iv-mut': palette.muted,
  } as React.CSSProperties

  const font = resolveFont(fontStyle)

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      style={vars}
      className="absolute inset-0 w-full h-full"
    >
      {/* SVG content here */}
    </svg>
  )
}
```

### Conversion rules

- **Hex values** → replace with `var(--iv-*)` using the token map:
  - Background fills → `var(--iv-bg)`
  - Surface/panel fills → `var(--iv-sur)`
  - Strokes, borders, geometric marks → `var(--iv-acc)`
  - Primary text → `var(--iv-tp)`
  - Secondary text → `var(--iv-ts)`
  - Small caps, attribution → `var(--iv-mut)`
  - Fixed colours (listed in handoff) → keep hardcoded
- **Hyphenated SVG attributes** → camelCase: `font-size` → `fontSize`, `stroke-width` → `strokeWidth`, `font-family` → `fontFamily`, etc.
- **Static text nodes** (Event_Title, Intro, Decorative) → keep literal strings from SVG
- **Dynamic text nodes** → replace with JSX expressions:
  - Names: split on `&` and render two `<text>` elements if needed, apply `font.namesStyle`
  - Date, venue, time, dressCode, rsvpContact: render conditionally with `{field && <text>...</text>}`
  - message / messageAttr: conditional, use `font.bodyStyle`
- **Photo background**: wrap the `<image>` element in `{photoSrc && <image href={photoSrc} ... />}`
- **`font-family` on text elements**: replace with `style={font.namesStyle}` (names) or `style={font.bodyStyle}` (body text)

---

## Step 3 — Register in index.ts

`apps/opus_pass/src/components/guests/invitation-templates/index.ts`

Add export line in alphabetical order:
```ts
export { ZanzibarArch } from './ZanzibarArch'
```

---

## Step 4 — Register in InvitationVisual.tsx

`apps/opus_pass/src/components/guests/InvitationVisual.tsx`

1. Add to import list
2. Add to `Treatment` union type: `| 'zanzibar-arch'`
3. Add preview palette to `PREVIEW_PALETTES` (use the first palette variant from the JSON)
4. Add case to the render switch:
```tsx
case 'zanzibar-arch': return <ZanzibarArch {...props} />
```

---

## Step 5 — Add product entry

`apps/opus_pass/src/data/invitations-products.ts`

Paste the palette JSON from the handoff directly into the product object. Use the first palette as the default for `PREVIEW_PALETTES`.

---

## Checklist before finishing

```
□ Component renders without TypeScript errors (run tsc --noEmit)
□ All dynamic fields wired to TemplateProps
□ Optional fields (time, dressCode, rsvpContact, message, messageAttr) are conditional
□ No hardcoded palette hex values except fixed colours
□ font-family replaced with resolveFont() styles on name/body text
□ Exported from index.ts
□ Treatment union updated
□ PREVIEW_PALETTES entry added
□ Product entry added to invitations-products.ts
```
