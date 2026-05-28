# OpusFesta Invitation Designer Handoff Guide

---

## Deliverables checklist

```text
□ SVG file            — named layers per spec below
□ Palette spec        — JSON, min 2 / max 5 variants
□ Swatch colours      — one hex per variant
□ Default font        — value from font list below
□ Fixed colours list  — hardcoded decorative colours marked "fixed"
□ Treatment name      — kebab-case slug, e.g. "zanzibar-arch"
```

---

## SVG export settings

**Illustrator:** File → Export As → SVG  
Styling: **Presentation Attributes** · Fonts: **SVG** (keep `<text>`, don't outline) · Decimals: **2** · Artboard: **300 × 400 px**

**Figma:** Select frame → Export → SVG (use Dev Mode for exact values)

**Canva:** not suitable — PNG reference only.

---

## Layer naming

These names become `id` attributes and tell the developer what's dynamic.

| Layer | Content | Dynamic? |
| --- | --- | --- |
| `Background` | Card background fill | Static — uses `iv/background` |
| `Photo` | Background image placeholder | `{photoSrc}` |
| `Event_Title` | "Save the Date" / "You Are Invited" | Static |
| `Intro` | Subline e.g. "for the wedding of" | Static |
| `Names` | Couple names | `{names}` |
| `Date` | Wedding date | `{date}` |
| `Time` | Ceremony time | `{time}` — omit if unused |
| `Venue` | Ceremony location | `{venue}` |
| `Reception` | Reception venue/time | shown only when filled |
| `Dress_code` | Dress code label + colour dots | `{dressCode}` |
| `Rsvp` | RSVP contact | `{rsvpContact}` — multiple contacts separated by `·` |
| `Message` | Quote or verse | optional `{message}` |
| `Message_attr` | Quote attribution | optional `{messageAttr}` |
| `Decorative` | Ornamental elements | Static — never dynamic |

Anything not in this table: name descriptively and treat as `Decorative`.

---

## Colour tokens

| Token | CSS variable | Used for |
| --- | --- | --- |
| `iv/background` | `var(--iv-bg)` | Card background |
| `iv/surface` | `var(--iv-sur)` | Inner panels |
| `iv/accent` | `var(--iv-acc)` | Borders, strokes, geometric marks |
| `iv/text-primary` | `var(--iv-tp)` | Names, headings |
| `iv/text-secondary` | `var(--iv-ts)` | Date, venue, labels |
| `iv/muted` | `var(--iv-mut)` | Small caps, attribution, fine print |

**Fixed colours** — decorative colours that shouldn't change across palettes stay hardcoded. List them separately:

```text
Fixed colours (do not tokenise):
  #f096b1  — petal pink
  #f0d497  — heart gold
  #7bbc7e  — leaf green
```

---

## Palette spec (JSON)

Paste directly into the product data file.

```json
[
  {
    "name": "Teal & Gold",
    "background":    "#00a79d",
    "surface":       "#00a79d",
    "accent":        "#6fc7b0",
    "textPrimary":   "#ffffff",
    "textSecondary": "#ffffff",
    "muted":         "rgba(255,255,255,0.65)"
  }
]
```

- `name` appears in the UI picker — keep it 1–3 words
- `surface` can differ from `background` when there's an inner panel
- `muted` opacity: 0.5–0.7

---

## Swatch colours

One hex per variant, same order as palette spec:

```text
swatches: ['#00a79d', '#0F2535', '#7A3B2E']
```

---

## Default font

| Value | Typeface | Character |
| --- | --- | --- |
| `serif` | Georgia | Classic |
| `script` | Georgia italic | Elegant |
| `playfair` | Playfair Display | Editorial |
| `cormorant` | Cormorant Garamond | Romantic |
| `dancing` | Dancing Script | Handwritten |
| `garamond` | EB Garamond | Scholarly |
| `montserrat` | Montserrat | Geometric |
| `modern` | System sans-serif | Minimal |

Fonts outside this list (e.g. Yellowtail): specify separately — dev will load via Google Fonts. Static/decorative fonts (`Event_Title` layer only) don't need to be in the picker.

---

## Treatment name

Unique kebab-case slug — describes visual style, not occasion.

```text
treatment: "zanzibar-arch"
```

Existing treatments: `classic-serif`, `minimal-line`, `modern-block`, `floral-border`, `navy-gold`, `blush-frame`, `sage-panel`, `cultural-red`, `arch-script`, `photo-overlay`, `save-the-date`, `save-the-date-photo`

---

## Developer conversion

Hand the completed checklist to Claude and run `/invitation-template`. The skill handles all conversion steps: SVG → TSX component, token substitution, camelCase attributes, registration in `index.ts` / `InvitationVisual.tsx`, and the product data entry.
