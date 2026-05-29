# OpusFesta Invitation Designer Handoff Guide

---

## Stationery suite

Every design sold on OpusFesta is a **suite** — a set of coordinated pieces that share the same palette and typography. Designers deliver each piece as a separate SVG. Every piece has a **front** (required) and an optional **back** (printed if the customer opts in).

| # | Piece | Required? | Typical artboard | Notes |
|---|-------|-----------|-----------------|-------|
| 1 | **Invitation Card** | Yes | 300 × 400 px | The primary card — all dynamic fields apply |
| 2 | **RSVP Card** | Yes | 300 × 200 px (A6 landscape) | Names, date, return-RSVP line; meal-selection checkbox optional |
| 3 | **Envelope** | Yes | 400 × 280 px (C5 landscape) | Addressing area, return address, optional liner graphic on back |
| 4 | **Wedding Ticket** | Yes | 560 × 200 px (boarding-pass landscape) | Accent-colour stub on left, QR placeholder on right — see ticket layer spec below |
| 5 | **Enclosure Card** | Optional | 300 × 200 px | Directions, accommodation, registry, or couple's note |
| 6 | **Menu** | Yes | 300 × 400 px | Per-table setting; show course lines as placeholder text |
| 7 | **Program** | Yes | 300 × 400 px | Order-of-events layout; bridal party list section |
| 8 | **Table Numbers & Sign** | Yes | Table card: 150 × 100 px · Welcome sign: 420 × 594 px (A2) | Number "##" as placeholder; sign shows couple names + date |
| 9 | **Wedding Swag** | Optional | Per-item spec (see below) | Print-ready art for branded merchandise |

**Front + back rule:** design the back as a separate SVG at the same artboard size. The back can be a simple repeat of the palette motif, a solid colour, or a full design. Mark the file `*-back.svg`.

---

## Deliverables checklist

```text
For each piece in the suite:
  □ <piece>-front.svg   — named layers per spec below
  □ <piece>-back.svg    — optional; solid colour or pattern is fine

For the suite as a whole:
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

## Ticket layer naming

The wedding ticket uses a boarding-pass layout. Additional layers specific to this piece:

| Layer | Content | Dynamic? |
| --- | --- | --- |
| `Stub` | Left accent-colour panel | Background uses `ticketAccentColor` |
| `Stub_Label` | Vertical text on the stub (e.g. "BOARDING PASS TO OUR WEDDING") | `{stubLabel}` |
| `Ticket_Title` | Large heading text (e.g. couple names or event name) | `{names}` |
| `Ticket_Date` | Date in ticket format | `{date}` |
| `Ticket_Time` | Ceremony time | `{time}` |
| `Ticket_Venue` | Venue name | `{venue}` |
| `Ticket_Address` | Full street address | `{address}` — omit row if blank |
| `Ticket_Gate` | Gate / door number placeholder | Static or `{gate}` |
| `Qr_Placeholder` | Box where the QR code is inserted | Replaced at render time |
| `Rsvp_Contact` | RSVP contact line | `{rsvpContact}` |
| `Ticket_Stub_Tear` | Perforated tear-line graphic | Static — `Decorative` |

Keep the stub and the body as sibling groups so the accent colour can be swapped independently.

---

## RSVP card layer naming

| Layer | Content | Dynamic? |
| --- | --- | --- |
| `Rsvp_Title` | "RSVP" or "Kindly Reply" heading | Static |
| `Names` | Couple names (repeated from invitation) | `{names}` |
| `Rsvp_Date` | Respond-by date | `{rsvpDeadline}` — omit if blank |
| `Rsvp_Contact` | Phone / WhatsApp to reply to | `{rsvpContact}` |
| `Meal_Options` | Checkbox area for meal selection | Optional; leave as static placeholder |
| `Dietary_Note` | Dietary restrictions line | Optional placeholder |
| `Decorative` | Ornamental elements | Static |

---

## Envelope layer naming

| Layer | Content | Dynamic? |
| --- | --- | --- |
| `Envelope_Body` | Main envelope face | Static |
| `Return_Address` | Return address top-left | `{returnAddress}` — omit if blank |
| `Address_Area` | Guest address block (centre or lower-left) | Placeholder lines only — addressing done in print workflow |
| `Liner` | Back-flap inner liner graphic | Back SVG only; can be palette motif |
| `Seal_Placeholder` | Wax seal / stamp mark | Static placeholder |
| `Decorative` | Borders, motifs | Static |

---

## Swag print specs

Swag items need print-ready artwork, not SVG templates. Deliver as **PDF (CMYK, bleed 3 mm)** or **AI file**. Each item uses the palette accent colour and couple names + date as the only dynamic text.

| Item | Print size | Notes |
|------|-----------|-------|
| Shirts | Front chest: 25 × 25 cm | Standard DTG/screen-print placement |
| Mugs | Wrap: 21 × 9 cm | Sublimation-ready; leave 5 mm safe zone each side |
| Napkins | 25 × 25 cm (folded 12.5 × 12.5) | Single-colour print preferred |
| Tote bags | Front panel: 30 × 30 cm | Natural canvas; leave 2 cm border |
| Koozies | Wrap: 21 × 8 cm | Standard can koozie template |
| Fans | 20 × 20 cm (fan face); handle area below | Include fold guide if applicable |
| Matchbooks | Cover: 5 × 3.5 cm | Cover + inside-cover layout |
| Stickers | Die-cut shape; supply path | 0.5 mm bleed; white underbase layer |

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

For multi-piece suites, run the skill once per piece SVG. The invitation card is always first — it establishes the treatment name and palette that all other pieces inherit. Ticket, RSVP card, envelope, and remaining pieces can be converted in any order afterwards.
