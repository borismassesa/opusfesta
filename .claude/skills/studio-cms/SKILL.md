---
name: studio-cms
description: "Studio CMS page section management. Use when working on page editors (Homepage, About, What We Do), CMS content fields, section CRUD operations, or admin page section configuration."
---

# Studio CMS Page Section Management

## Database

- **Table:** `studio_page_sections`
- Each section belongs to a page: `homepage`, `about`, `what-we-do`
- Sections identified by `page` + `section_key` (unique pair)

## API Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/admin/page-sections?page=homepage` | Fetch all sections for a page |
| `POST` | `/api/admin/page-sections` | Create or upsert a section |
| `DELETE` | `/api/admin/page-sections?id={id}` | Remove a section |

### API Pattern

```typescript
// Fetch sections server-side
const supabase = getStudioSupabaseAdmin()
const { data: sections } = await supabase
  .from('studio_page_sections')
  .select('*')
  .eq('page', 'homepage')
  .order('sort_order')
```

## SectionField Interface

Each section contains typed fields:

| Type | Description | Admin Input |
|------|-------------|-------------|
| `text` | Single-line text | Text input |
| `textarea` | Multi-line text | Textarea |
| `image` | Single image | AdminMediaUpload |
| `video` | Video URL or upload | URL input or AdminMediaUpload |
| `image_list` | Array of images | Sortable image grid |
| `key_value_list` | Key-value pairs | Dynamic key-value editor |
| `string_list` | Array of strings | Dynamic list input |
| `steps_list` | Ordered step items | Sortable step editor |
| `select` | Dropdown selection | Select input with options |
| `range` | Numeric range slider | Range input |

## AdminMediaUpload Component

```tsx
<AdminMediaUpload
  bucket="studio-assets"
  path={`cms/${page}/${sectionKey}`}
  onUpload={(url) => updateField(fieldKey, url)}
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
/>
```

- Uploads to Supabase Storage `studio-assets` bucket
- Returns public URL on success
- Handles image preview, loading state, error display

## Public Rendering Pipeline

```
1. Page component (server) fetches sections by page name
2. Sections array passed to SectionRenderer
3. SectionRenderer maps section_key → component
4. Each component receives section.fields as props
5. Fallback to default content if section not found
```

```typescript
// Section renderer pattern
const SECTION_MAP: Record<string, React.ComponentType<SectionProps>> = {
  'hero': HeroSection,
  'services-grid': ServicesGrid,
  'testimonials': TestimonialsSection,
  'about-intro': AboutIntro,
}

function renderSection(section: PageSection) {
  const Component = SECTION_MAP[section.section_key]
  if (!Component) return null
  return <Component fields={section.fields} />
}
```

## Design System (Brutalist)

- `border-3` thick borders on section containers
- `shadow-brutal` offset box shadows on cards and CTAs
- `font-mono` for headings and accent text
- Brand CSS variables: `--brand-primary`, `--brand-secondary`, `--brand-accent`
- High-contrast, bold visual language throughout all CMS-rendered sections
