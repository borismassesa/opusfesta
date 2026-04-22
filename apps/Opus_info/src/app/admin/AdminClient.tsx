'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogOut, Eye, Save, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { translations } from '@/lib/i18n'
import type { Lang } from '@/lib/i18n'
import StringListEditor from './components/StringListEditor'
import ObjectListEditor from './components/ObjectListEditor'

type Section = 'hero' | 'problem' | 'platform' | 'whoWeServe' | 'quote' | 'opportunity' | 'cta'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'problem', label: 'Problem' },
  { key: 'platform', label: 'Platform' },
  { key: 'whoWeServe', label: 'Who We Serve' },
  { key: 'quote', label: 'Quote' },
  { key: 'opportunity', label: 'Opportunity' },
  { key: 'cta', label: 'CTA / Waitlist' },
]

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white"
    />
  )
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white resize-none"
    />
  )
}

// ─── Section editors ──────────────────────────────────────────────────────────

function HeroEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const s = (k: string) => String(data[k] ?? '')
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <Field label="Badge"><Input value={s('badge')} onChange={(v) => set('badge', v)} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Heading Line 1"><Input value={s('heading1')} onChange={(v) => set('heading1', v)} /></Field>
        <Field label="Heading Line 2"><Input value={s('heading2')} onChange={(v) => set('heading2', v)} /></Field>
        <Field label="Heading Line 3 (italic)"><Input value={s('heading3')} onChange={(v) => set('heading3', v)} /></Field>
      </div>
      <Field label="Body"><Textarea value={s('body')} onChange={(v) => set('body', v)} rows={4} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tag 1"><Input value={s('tag1')} onChange={(v) => set('tag1', v)} /></Field>
        <Field label="Tag 2"><Input value={s('tag2')} onChange={(v) => set('tag2', v)} /></Field>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pillar 1</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Label"><Input value={s('pillar1Label')} onChange={(v) => set('pillar1Label', v)} /></Field>
        <Field label="Text"><Input value={s('pillar1Text')} onChange={(v) => set('pillar1Text', v)} /></Field>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pillar 2</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Label"><Input value={s('pillar2Label')} onChange={(v) => set('pillar2Label', v)} /></Field>
        <Field label="Text"><Input value={s('pillar2Text')} onChange={(v) => set('pillar2Text', v)} /></Field>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pillar 3</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Label"><Input value={s('pillar3Label')} onChange={(v) => set('pillar3Label', v)} /></Field>
        <Field label="Text"><Input value={s('pillar3Text')} onChange={(v) => set('pillar3Text', v)} /></Field>
      </div>
    </div>
  )
}

function ProblemEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const s = (k: string) => String(data[k] ?? '')
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <Field label="Badge"><Input value={s('badge')} onChange={(v) => set('badge', v)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Heading Line 1"><Input value={s('heading1')} onChange={(v) => set('heading1', v)} /></Field>
        <Field label="Heading Line 2 (italic)"><Input value={s('heading2')} onChange={(v) => set('heading2', v)} /></Field>
      </div>
      <Field label="Body"><Textarea value={s('body')} onChange={(v) => set('body', v)} /></Field>
      <Field label="Pain Points">
        <ObjectListEditor
          value={(data.items as Record<string, unknown>[]) ?? []}
          onChange={(v) => set('items', v)}
          fields={[
            { key: 'num', label: 'Number (e.g. 01)' },
            { key: 'title', label: 'Title' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ]}
          addLabel="Add pain point"
        />
      </Field>
    </div>
  )
}

function PlatformEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const s = (k: string) => String(data[k] ?? '')
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <Field label="Badge"><Input value={s('badge')} onChange={(v) => set('badge', v)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Heading Line 1"><Input value={s('heading1')} onChange={(v) => set('heading1', v)} /></Field>
        <Field label="Heading Line 2 (italic)"><Input value={s('heading2')} onChange={(v) => set('heading2', v)} /></Field>
      </div>
      <Field label="Body"><Textarea value={s('body')} onChange={(v) => set('body', v)} /></Field>
      <Field label="Features">
        <ObjectListEditor
          value={(data.items as Record<string, unknown>[]) ?? []}
          onChange={(v) => set('items', v)}
          fields={[
            { key: 'num', label: 'Number (e.g. 01)' },
            { key: 'title', label: 'Title' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ]}
          addLabel="Add feature"
        />
      </Field>
    </div>
  )
}

function WhoWeServeEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const s = (k: string) => String(data[k] ?? '')
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <Field label="Badge"><Input value={s('badge')} onChange={(v) => set('badge', v)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Heading Line 1"><Input value={s('heading1')} onChange={(v) => set('heading1', v)} /></Field>
        <Field label="Heading Line 2 (italic)"><Input value={s('heading2')} onChange={(v) => set('heading2', v)} /></Field>
      </div>
      <Field label="Body"><Textarea value={s('body')} onChange={(v) => set('body', v)} /></Field>
      <div className="border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Couples Panel</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Label"><Input value={s('couplesLabel')} onChange={(v) => set('couplesLabel', v)} /></Field>
          <Field label="Heading Line 1"><Input value={s('couplesHeading1')} onChange={(v) => set('couplesHeading1', v)} /></Field>
        </div>
        <Field label="Heading Line 2"><Input value={s('couplesHeading2')} onChange={(v) => set('couplesHeading2', v)} /></Field>
        <div className="mt-4">
          <Field label="Couple Features">
            <StringListEditor
              value={(data.coupleFeatures as string[]) ?? []}
              onChange={(v) => set('coupleFeatures', v)}
            />
          </Field>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Vendors Panel</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Label"><Input value={s('vendorsLabel')} onChange={(v) => set('vendorsLabel', v)} /></Field>
          <Field label="Heading Line 1"><Input value={s('vendorsHeading1')} onChange={(v) => set('vendorsHeading1', v)} /></Field>
        </div>
        <Field label="Heading Line 2"><Input value={s('vendorsHeading2')} onChange={(v) => set('vendorsHeading2', v)} /></Field>
        <div className="mt-4">
          <Field label="Vendor Features">
            <StringListEditor
              value={(data.vendorFeatures as string[]) ?? []}
              onChange={(v) => set('vendorFeatures', v)}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

function QuoteEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const s = (k: string) => String(data[k] ?? '')
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <Field label="Line 1 (black)"><Input value={s('line1')} onChange={(v) => set('line1', v)} /></Field>
      <Field label="Line 2 (purple)"><Input value={s('line2')} onChange={(v) => set('line2', v)} /></Field>
      <Field label="Body"><Textarea value={s('body')} onChange={(v) => set('body', v)} rows={4} /></Field>
    </div>
  )
}

function OpportunityEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const s = (k: string) => String(data[k] ?? '')
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <Field label="Badge"><Input value={s('badge')} onChange={(v) => set('badge', v)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Heading Line 1"><Input value={s('heading1')} onChange={(v) => set('heading1', v)} /></Field>
        <Field label="Heading Line 2 (italic)"><Input value={s('heading2')} onChange={(v) => set('heading2', v)} /></Field>
      </div>
      <Field label="Body"><Textarea value={s('body')} onChange={(v) => set('body', v)} /></Field>
      <Field label="Stats">
        <ObjectListEditor
          value={(data.stats as Record<string, unknown>[]) ?? []}
          onChange={(v) => set('stats', v)}
          fields={[
            { key: 'stat', label: 'Stat (leave empty for ∞ icon)', nullable: true },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ]}
          addLabel="Add stat"
        />
      </Field>
    </div>
  )
}

function CtaEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const s = (k: string) => String(data[k] ?? '')
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <Field label="Badge"><Input value={s('badge')} onChange={(v) => set('badge', v)} /></Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Heading Line 1"><Input value={s('heading1')} onChange={(v) => set('heading1', v)} /></Field>
        <Field label="Heading Line 2"><Input value={s('heading2')} onChange={(v) => set('heading2', v)} /></Field>
        <Field label="Heading Line 3 (italic)"><Input value={s('heading3')} onChange={(v) => set('heading3', v)} /></Field>
      </div>
      <Field label="Body"><Textarea value={s('body')} onChange={(v) => set('body', v)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Input Placeholder"><Input value={s('placeholder')} onChange={(v) => set('placeholder', v)} /></Field>
        <Field label="Button Text"><Input value={s('button')} onChange={(v) => set('button', v)} /></Field>
      </div>
    </div>
  )
}

// ─── Section editor dispatcher ─────────────────────────────────────────────

function SectionEditorContent({ section, data, onChange }: {
  section: Section
  data: Record<string, unknown>
  onChange: (d: Record<string, unknown>) => void
}) {
  switch (section) {
    case 'hero': return <HeroEditor data={data} onChange={onChange} />
    case 'problem': return <ProblemEditor data={data} onChange={onChange} />
    case 'platform': return <PlatformEditor data={data} onChange={onChange} />
    case 'whoWeServe': return <WhoWeServeEditor data={data} onChange={onChange} />
    case 'quote': return <QuoteEditor data={data} onChange={onChange} />
    case 'opportunity': return <OpportunityEditor data={data} onChange={onChange} />
    case 'cta': return <CtaEditor data={data} onChange={onChange} />
  }
}

// ─── Save status ───────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ─── Main dashboard ────────────────────────────────────────────────────────

function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('hero')
  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [content, setContent] = useState<Record<Lang, Record<string, Record<string, unknown>>>>({
    en: Object.fromEntries(Object.keys(translations.en).map((k) => [k, translations.en[k as keyof typeof translations.en] as Record<string, unknown>])),
    sw: Object.fromEntries(Object.keys(translations.sw).map((k) => [k, translations.sw[k as keyof typeof translations.sw] as Record<string, unknown>])),
  })
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({})

  // Load DB overrides on mount
  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((rows: { lang: Lang; section_key: string; content: Record<string, unknown> }[]) => {
        setContent((prev) => {
          const next = { ...prev, en: { ...prev.en }, sw: { ...prev.sw } }
          for (const row of rows) {
            next[row.lang][row.section_key] = { ...next[row.lang][row.section_key], ...row.content }
          }
          return next
        })
      })
      .catch(() => {})
  }, [])

  const sectionData = content[activeLang][activeSection] ?? {}

  const handleChange = (data: Record<string, unknown>) => {
    setContent((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [activeSection]: data },
    }))
  }

  const save = useCallback(async () => {
    const key = `${activeLang}-${activeSection}`
    setSaveStatus((p) => ({ ...p, [key]: 'saving' }))
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: activeLang, section_key: activeSection, content: sectionData }),
      })
      setSaveStatus((p) => ({ ...p, [key]: res.ok ? 'saved' : 'error' }))
      if (res.ok) setTimeout(() => setSaveStatus((p) => ({ ...p, [key]: 'idle' })), 3000)
    } catch {
      setSaveStatus((p) => ({ ...p, [key]: 'error' }))
    }
  }, [activeLang, activeSection, sectionData])

  const statusKey = `${activeLang}-${activeSection}`
  const status = saveStatus[statusKey] ?? 'idle'

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="OpusFesta" className="h-7 w-auto" />
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-2">Admin CMS</p>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          <p className="px-5 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-300">Sections</p>
          {SECTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${
                activeSection === key
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {label}
              {activeSection === key && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors w-full"
          >
            <Eye className="w-4 h-4" />
            View live site
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {SECTIONS.find((s) => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs text-gray-400">Edit content for both languages</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang tabs */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              {(['en', 'sw'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLang(l)}
                  className={`px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded-md transition-all ${
                    activeLang === l ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Save */}
            <button
              onClick={save}
              disabled={status === 'saving'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {status === 'saving' ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : status === 'saved' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : status === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error' : 'Save'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">
            <SectionEditorContent
              section={activeSection}
              data={sectionData}
              onChange={handleChange}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Login form ────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) onSuccess()
      else setError('Invalid password')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="OpusFesta" className="h-10 w-auto mx-auto mb-4" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Admin CMS</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function AdminClient() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/admin/content?lang=en&section=hero')
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false))
  }, [])

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />
  return <Dashboard />
}
