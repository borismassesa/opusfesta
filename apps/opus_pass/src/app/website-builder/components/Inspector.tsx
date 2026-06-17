'use client'

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import {
  FONT_STACKS,
  FONT_OPTIONS,
  ANIMATIONS,
  type Align,
  type Block,
  type Section,
  type SiteDoc,
  type Selection,
} from '@/lib/builder/types'
import type { BuilderApi } from '../useBuilder'
import {
  ColorRow,
  Dropdown,
  Field,
  Group,
  NumberInput,
  SectionLabel,
  SegmentedAlign,
  Slider,
  TextArea,
  TextInput,
  Toggle,
} from './ui'

type Api = BuilderApi

const ALIGN_OPTS: { key: Align; icon: React.ReactNode; label: string }[] = [
  { key: 'left', icon: <AlignLeft size={16} />, label: 'left' },
  { key: 'center', icon: <AlignCenter size={16} />, label: 'center' },
  { key: 'right', icon: <AlignRight size={16} />, label: 'right' },
  { key: 'justify', icon: <AlignJustify size={16} />, label: 'justify' },
]

const BLOCK_LABEL: Record<Block['type'], string> = {
  eyebrow: 'Eyebrow',
  heading: 'Heading',
  text: 'Text Block',
  button: 'Button',
  image: 'Image',
  divider: 'Divider',
  countdown: 'Countdown',
  rsvp: 'RSVP Form',
  map: 'Venue Map',
  registry: 'Registry',
  gallery: 'Gallery',
}

function findSelected(doc: SiteDoc, selection: Selection) {
  if (!selection) return { section: null as Section | null, block: null as Block | null }
  const section = doc.sections.find((s) => s.id === selection.sectionId) ?? null
  if (selection.kind === 'section') return { section, block: null }
  const block = section?.blocks.find((b) => b.id === selection.blockId) ?? null
  return { section, block }
}

export function inspectorTitle(doc: SiteDoc, selection: Selection): { title: string; sub: string } {
  const { section, block } = findSelected(doc, selection)
  if (block) return { title: BLOCK_LABEL[block.type], sub: `Section: ${section?.name ?? ''}` }
  if (section) return { title: section.name, sub: 'Section settings' }
  return { title: 'Site Settings', sub: 'Theme & navigation' }
}

export function Inspector({ api }: { api: Api }) {
  const { doc, selection } = api
  const { section, block } = findSelected(doc, selection)

  if (block && section) return <BlockInspector api={api} section={section} block={block} />
  if (section) return <SectionInspector api={api} section={section} />
  return <SiteInspector api={api} />
}

// ── Block ────────────────────────────────────────────────────────────────────

function BlockInspector({ api, section, block }: { api: Api; section: Section; block: Block }) {
  const set = (patch: Partial<Block>) => api.updateBlock(section.id, block.id, patch)
  const idx = section.blocks.findIndex((b) => b.id === block.id)

  return (
    <div className="space-y-7">
      <BlockActions api={api} section={section} block={block} idx={idx} />

      {/* Content */}
      {block.type === 'heading' || block.type === 'eyebrow' ? (
        <Group title="Content">
          <Field label="Text">
            <TextInput value={block.text} onChange={(text) => set({ text } as Partial<Block>)} />
          </Field>
        </Group>
      ) : block.type === 'text' ? (
        <Group title="Content">
          <Field label="Text">
            <TextArea value={block.text} onChange={(text) => set({ text } as Partial<Block>)} />
          </Field>
        </Group>
      ) : block.type === 'button' ? (
        <Group title="Content">
          <Field label="Label">
            <TextInput value={block.label} onChange={(label) => set({ label } as Partial<Block>)} />
          </Field>
          <Field label="Link">
            <TextInput value={block.href} onChange={(href) => set({ href } as Partial<Block>)} />
          </Field>
          <Field label="Style">
            <Dropdown
              value={block.variant === 'solid' ? 'Solid' : 'Outline'}
              options={['Solid', 'Outline']}
              onChange={(v) => set({ variant: v === 'Solid' ? 'solid' : 'outline' } as Partial<Block>)}
            />
          </Field>
        </Group>
      ) : block.type === 'image' ? (
        <Group title="Image">
          <Field label="Source URL">
            <TextInput value={block.src} onChange={(src) => set({ src } as Partial<Block>)} />
          </Field>
          <Slider label="Height" value={block.height} max={640} onChange={(height) => set({ height } as Partial<Block>)} />
          <Slider label="Corner radius" value={block.radius} max={40} onChange={(radius) => set({ radius } as Partial<Block>)} />
        </Group>
      ) : block.type === 'countdown' ? (
        <Group title="Countdown">
          <Field label="Target date">
            <input
              type="date"
              value={block.date}
              onChange={(e) => set({ date: e.target.value } as Partial<Block>)}
              className="w-full rounded-lg border border-black/12 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#C9A0DC]"
            />
          </Field>
          <Field label="Caption">
            <TextInput value={block.label} onChange={(label) => set({ label } as Partial<Block>)} />
          </Field>
        </Group>
      ) : block.type === 'rsvp' ? (
        <Group title="RSVP">
          <Field label="Title">
            <TextInput value={block.title} onChange={(title) => set({ title } as Partial<Block>)} />
          </Field>
          <Field label="Note">
            <TextInput value={block.note} onChange={(note) => set({ note } as Partial<Block>)} />
          </Field>
        </Group>
      ) : block.type === 'map' ? (
        <Group title="Venue">
          <Field label="Venue name">
            <TextInput value={block.venue} onChange={(venue) => set({ venue } as Partial<Block>)} />
          </Field>
          <Field label="Address">
            <TextInput value={block.address} onChange={(address) => set({ address } as Partial<Block>)} />
          </Field>
        </Group>
      ) : block.type === 'registry' ? (
        <Group title="Registry links">
          {block.items.map((it, i) => (
            <div key={it.id} className="space-y-2 rounded-lg border border-black/8 p-3">
              <TextInput
                value={it.label}
                onChange={(label) =>
                  set({ items: block.items.map((x, xi) => (xi === i ? { ...x, label } : x)) } as Partial<Block>)
                }
              />
              <TextInput
                value={it.href}
                onChange={(href) =>
                  set({ items: block.items.map((x, xi) => (xi === i ? { ...x, href } : x)) } as Partial<Block>)
                }
              />
            </div>
          ))}
        </Group>
      ) : null}

      {/* Typography */}
      {block.type === 'heading' && (
        <Group title="Typography">
          <Field label="Font Family">
            <Dropdown
              value={block.font}
              options={FONT_OPTIONS}
              onChange={(font) => set({ font } as Partial<Block>)}
              renderOption={(f) => ({ fontFamily: FONT_STACKS[f as keyof typeof FONT_STACKS] })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Font Size">
              <NumberInput value={block.fontSize} min={12} max={120} suffix="px" onChange={(fontSize) => set({ fontSize } as Partial<Block>)} />
            </Field>
            <Field label="Letter Spacing">
              <NumberInput value={block.letterSpacing} min={-10} max={20} suffix="%" onChange={(letterSpacing) => set({ letterSpacing } as Partial<Block>)} />
            </Field>
          </div>
        </Group>
      )}
      {block.type === 'text' && (
        <Group title="Typography">
          <Field label="Font Size">
            <NumberInput value={block.fontSize} min={10} max={48} suffix="px" onChange={(fontSize) => set({ fontSize } as Partial<Block>)} />
          </Field>
        </Group>
      )}
      {block.type === 'eyebrow' && (
        <Group title="Typography">
          <Field label="Letter Spacing">
            <NumberInput value={block.letterSpacing} min={0} max={60} suffix="%" onChange={(letterSpacing) => set({ letterSpacing } as Partial<Block>)} />
          </Field>
        </Group>
      )}

      {/* Style & color */}
      {(block.type === 'heading' || block.type === 'text' || block.type === 'eyebrow' || block.type === 'divider') && (
        <Group title="Style & Color">
          <Field label={block.type === 'divider' ? 'Line color' : 'Text Color'}>
            <ColorRow value={block.color} onChange={(color) => set({ color } as Partial<Block>)} />
          </Field>
        </Group>
      )}

      {/* Alignment (all blocks) */}
      <Group title="Alignment">
        <SegmentedAlign value={block.align} options={ALIGN_OPTS} onChange={(align) => set({ align } as Partial<Block>)} />
      </Group>

      {/* Layout */}
      <Group title="Layout">
        <Slider label="Top Margin" value={block.mt} max={120} onChange={(mt) => set({ mt } as Partial<Block>)} />
        <Slider label="Bottom Margin" value={block.mb} max={120} onChange={(mb) => set({ mb } as Partial<Block>)} />
      </Group>

      {/* Entrance animation (heading) */}
      {block.type === 'heading' && (
        <div>
          <div className="flex items-center justify-between">
            <SectionLabel>Entrance Animation</SectionLabel>
            <Toggle on={block.animate} onChange={(animate) => set({ animate } as Partial<Block>)} />
          </div>
          {block.animate && (
            <div className="mt-3">
              <Dropdown value={block.animation} options={ANIMATIONS} onChange={(animation) => set({ animation } as Partial<Block>)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BlockActions({ api, section, block, idx }: { api: Api; section: Section; block: Block; idx: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => api.moveBlock(section.id, block.id, -1)}
        disabled={idx <= 0}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-gray-600 transition-colors hover:bg-black/5 disabled:opacity-30"
        aria-label="Move up"
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        onClick={() => api.moveBlock(section.id, block.id, 1)}
        disabled={idx >= section.blocks.length - 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-gray-600 transition-colors hover:bg-black/5 disabled:opacity-30"
        aria-label="Move down"
      >
        <ArrowDown size={15} />
      </button>
      <button
        type="button"
        onClick={() => api.removeBlock(section.id, block.id)}
        className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-[12.5px] font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────────

function SectionInspector({ api, section }: { api: Api; section: Section }) {
  const set = (patch: Partial<Section>) => api.updateSection(section.id, patch)
  const idx = api.doc.sections.findIndex((s) => s.id === section.id)
  return (
    <div className="space-y-7">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => api.moveSection(section.id, -1)}
          disabled={idx <= 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-gray-600 hover:bg-black/5 disabled:opacity-30"
          aria-label="Move section up"
        >
          <ArrowUp size={15} />
        </button>
        <button
          type="button"
          onClick={() => api.moveSection(section.id, 1)}
          disabled={idx >= api.doc.sections.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-gray-600 hover:bg-black/5 disabled:opacity-30"
          aria-label="Move section down"
        >
          <ArrowDown size={15} />
        </button>
        {section.type !== 'hero' && (
          <button
            type="button"
            onClick={() => api.removeSection(section.id)}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-[12.5px] font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      <Group title="Section">
        <Field label="Name">
          <TextInput value={section.name} onChange={(name) => set({ name })} />
        </Field>
        {section.type === 'hero' && (
          <Field label="Layout">
            <Dropdown
              value={section.layout === 'split' ? 'Split Editorial' : section.layout === 'centered' ? 'Classic Centered' : 'Modern Minimalist'}
              options={['Classic Centered', 'Split Editorial', 'Modern Minimalist']}
              onChange={(v) =>
                set({ layout: v === 'Split Editorial' ? 'split' : v === 'Classic Centered' ? 'centered' : 'photo' })
              }
            />
          </Field>
        )}
      </Group>

      <Group title="Background">
        <Field label="Type">
          <Dropdown
            value={section.background.kind === 'image' ? 'Image' : 'Solid color'}
            options={['Solid color', 'Image']}
            onChange={(v) =>
              set({
                background: {
                  ...section.background,
                  kind: v === 'Image' ? 'image' : 'color',
                  value:
                    v === 'Image'
                      ? section.background.value.startsWith('/')
                        ? section.background.value
                        : '/assets/images/couples_together.jpg'
                      : section.background.value.startsWith('#')
                        ? section.background.value
                        : '#FBF9F5',
                },
              })
            }
          />
        </Field>
        {section.background.kind === 'image' ? (
          <>
            <Field label="Image URL">
              <TextInput
                value={section.background.value}
                onChange={(value) => set({ background: { ...section.background, value } })}
              />
            </Field>
            <Slider
              label="Overlay darkness"
              value={section.background.overlay}
              max={80}
              suffix="%"
              onChange={(overlay) => set({ background: { ...section.background, overlay } })}
            />
          </>
        ) : (
          <Field label="Color">
            <ColorRow value={section.background.value} onChange={(value) => set({ background: { ...section.background, value } })} />
          </Field>
        )}
      </Group>

      <Group title="Spacing">
        <Slider label="Vertical padding" value={section.padding} max={180} onChange={(padding) => set({ padding })} />
      </Group>
    </div>
  )
}

// ── Site ────────────────────────────────────────────────────────────────────

function SiteInspector({ api }: { api: Api }) {
  const { doc } = api
  const setPalette = (patch: Partial<typeof doc.theme.palette>) =>
    api.updateTheme({ palette: { ...doc.theme.palette, ...patch } })
  return (
    <div className="space-y-7">
      <Group title="Couple">
        <Field label="Site title">
          <TextInput value={doc.title} onChange={api.setTitle} />
        </Field>
      </Group>

      <Group title="Fonts">
        <Field label="Headings">
          <Dropdown
            value={doc.theme.headingFont}
            options={FONT_OPTIONS}
            onChange={(headingFont) => api.updateTheme({ headingFont: headingFont as typeof doc.theme.headingFont })}
            renderOption={(f) => ({ fontFamily: FONT_STACKS[f as keyof typeof FONT_STACKS] })}
          />
        </Field>
        <Field label="Body">
          <Dropdown
            value={doc.theme.bodyFont}
            options={FONT_OPTIONS}
            onChange={(bodyFont) => api.updateTheme({ bodyFont: bodyFont as typeof doc.theme.bodyFont })}
            renderOption={(f) => ({ fontFamily: FONT_STACKS[f as keyof typeof FONT_STACKS] })}
          />
        </Field>
      </Group>

      <Group title="Palette">
        <Field label="Accent">
          <ColorRow value={doc.theme.palette.accent} onChange={(accent) => setPalette({ accent })} />
        </Field>
        <Field label="Ink (text)">
          <ColorRow value={doc.theme.palette.ink} onChange={(ink) => setPalette({ ink })} />
        </Field>
        <Field label="Surface">
          <ColorRow value={doc.theme.palette.surface} onChange={(surface) => setPalette({ surface })} />
        </Field>
        <Field label="Page background">
          <ColorRow value={doc.theme.palette.bg} onChange={(bg) => setPalette({ bg })} />
        </Field>
      </Group>

      <p className="rounded-lg bg-[#F7F6F2] px-3 py-2.5 text-[12px] leading-relaxed text-gray-500">
        Tip: click any element on the canvas to edit it, or use the left panel to add sections, elements and widgets.
      </p>
    </div>
  )
}
