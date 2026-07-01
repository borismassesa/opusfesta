import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'
import {
  FOLLOWUP_STATUS_LABELS,
  readBullets,
  readBlockers,
  readFollowups,
  readGoals,
  readGroupedBullets,
  readMetrics,
  readNumber,
  readText,
  type ReportSection,
  type ReportSubmission,
} from '@/app/(admin)/workforce/_lib/report-schema'

// Server-side PDF render of a report submission, for emailing to whoever
// it's submitted to. Mirrors the branded letterhead used by
// ReportDocument.tsx (the in-app / print view) so both outputs match.

const LOGO_URL = 'https://www.opusfesta.com/assets/logo/opusfesta-logo-black.png'
const ACCENT = '#6B4E8C'

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    paddingTop: 44,
    paddingHorizontal: 44,
    // Clears the fixed letterhead (~90pt incl. its bottom offset) on every page.
    paddingBottom: 96,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingBottom: 14,
  },
  logo: { height: 34, width: 105 },
  tagline: { marginTop: 4, fontSize: 6.5, letterSpacing: 1.5, color: ACCENT, fontFamily: 'Helvetica-Bold' },
  companyBlock: { alignItems: 'flex-end', fontSize: 8.5, lineHeight: 1.5, color: '#4b5563' },
  companyName: { fontFamily: 'Helvetica-Bold', color: ACCENT },
  title: { marginTop: 22, fontSize: 16, fontFamily: 'Helvetica-Bold' },
  meta: { marginTop: 8, fontSize: 9.5, lineHeight: 1.6, color: '#374151' },
  metaLabel: { fontFamily: 'Helvetica-Bold' },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  body: { fontSize: 9.5, lineHeight: 1.5, color: '#1f2937' },
  empty: { fontSize: 9.5, color: '#9ca3af', fontStyle: 'italic' },
  bulletRow: { flexDirection: 'row', gap: 5, marginBottom: 3 },
  bulletMark: { width: 8 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.5, color: '#1f2937' },
  groupLabel: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', marginBottom: 3, marginTop: 6 },
  table: { marginTop: 2, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 3 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  thCell: {
    flex: 1,
    padding: 5,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    textTransform: 'uppercase',
  },
  tdCell: { flex: 1, padding: 5, fontSize: 9 },
  itemBlock: { marginBottom: 8 },
  itemMetaRow: { flexDirection: 'row', gap: 14, marginTop: 2, fontSize: 8.5, color: '#6b7280' },
  statusBadge: {
    marginLeft: 6,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 3,
  },
  // Letterhead footer — pinned to the bottom of every page, matching the
  // invoice PDF (invoice-pdf.tsx) so all OpusFesta PDFs share one design.
  letterhead: { position: 'absolute', left: 44, right: 44, bottom: 26 },
  lhCols: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  lhBlock: { fontSize: 7.5, lineHeight: 1.55, color: '#6b7280', flex: 1 },
  lhName: { fontFamily: 'Helvetica-Bold', color: ACCENT },
  lhContact: { flex: 1, alignItems: 'flex-end' },
  lhBar: { height: 4, borderRadius: 2, backgroundColor: ACCENT },
})

function statusStyle(status: string): { bg: string; fg: string } {
  if (status === 'done') return { bg: '#ecfdf5', fg: '#047857' }
  if (status === 'partial') return { bg: '#fffbeb', fg: '#b45309' }
  if (status === 'not_done') return { bg: '#fef2f2', fg: '#b91c1c' }
  return { bg: '#f3f4f6', fg: '#6b7280' }
}

function SectionBody({ section, submission }: { section: ReportSection; submission: ReportSubmission }) {
  const { content } = submission
  switch (section.type) {
    case 'text':
    case 'short_text':
    case 'department_select': {
      const v = readText(content, section)
      return v ? <Text style={s.body}>{v}</Text> : <Text style={s.empty}>—</Text>
    }
    case 'number': {
      const n = readNumber(content, section)
      return <Text style={s.body}>{n ?? '—'}</Text>
    }
    case 'bullets': {
      const items = readBullets(content, section)
      if (items.length === 0) return <Text style={s.empty}>—</Text>
      return (
        <View>
          {items.map((it, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={s.bulletMark}>•</Text>
              <Text style={s.bulletText}>{it}</Text>
            </View>
          ))}
        </View>
      )
    }
    case 'grouped_bullets': {
      const groups = readGroupedBullets(content, section)
      const any = groups.some((g) => g.items.length > 0)
      if (!any) return <Text style={s.empty}>—</Text>
      return (
        <View>
          {groups.map((g) => (
            <View key={g.id}>
              <Text style={s.groupLabel}>
                {g.label} ({g.items.length})
              </Text>
              {g.items.map((it, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletMark}>•</Text>
                  <Text style={s.bulletText}>{it}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )
    }
    case 'metrics_table': {
      const rows = readMetrics(content, section)
      if (rows.length === 0) return <Text style={s.empty}>—</Text>
      return (
        <View style={s.table}>
          <View style={s.tr}>
            <Text style={s.thCell}>Metric</Text>
            <Text style={s.thCell}>This month</Text>
            <Text style={s.thCell}>Last month</Text>
            <Text style={s.thCell}>Target</Text>
          </View>
          {rows.map((r, i) => (
            <View key={i} style={i === rows.length - 1 ? { flexDirection: 'row' } : s.tr}>
              <Text style={s.tdCell}>{r.name}</Text>
              <Text style={s.tdCell}>{r.thisMonth || '—'}</Text>
              <Text style={s.tdCell}>{r.lastMonth || '—'}</Text>
              <Text style={s.tdCell}>{r.target || '—'}</Text>
            </View>
          ))}
        </View>
      )
    }
    case 'goal_list': {
      const items = readGoals(content, section)
      if (items.length === 0) return <Text style={s.empty}>—</Text>
      return (
        <View>
          {items.map((it, i) => (
            <View key={i} style={s.itemBlock}>
              <View style={s.bulletRow}>
                <Text style={s.bulletMark}>•</Text>
                <Text style={s.bulletText}>{it.text}</Text>
              </View>
              <View style={s.itemMetaRow}>
                <Text>Owner: {it.owner || '—'}</Text>
                <Text>Target date: {it.targetDate ? formatLongDate(it.targetDate) : '—'}</Text>
              </View>
            </View>
          ))}
        </View>
      )
    }
    case 'blocker_list': {
      const items = readBlockers(content, section)
      if (items.length === 0) return <Text style={s.empty}>—</Text>
      return (
        <View>
          {items.map((it, i) => (
            <View key={i} style={s.itemBlock}>
              <View style={s.bulletRow}>
                <Text style={s.bulletMark}>•</Text>
                <Text style={s.bulletText}>{it.text}</Text>
              </View>
              <View style={s.itemMetaRow}>
                <Text>Waiting on: {it.waitingOn || '—'}</Text>
                <Text>Since: {it.since ? formatLongDate(it.since) : '—'}</Text>
              </View>
            </View>
          ))}
        </View>
      )
    }
    case 'followup_list': {
      const items = readFollowups(content, section)
      if (items.length === 0) return <Text style={s.empty}>No carried-forward priorities this period.</Text>
      return (
        <View>
          {items.map((it, i) => {
            const st = statusStyle(it.status)
            return (
              <View key={i} style={s.itemBlock}>
                <View style={[s.bulletRow, { alignItems: 'center' }]}>
                  <Text style={s.bulletMark}>•</Text>
                  <Text style={s.bulletText}>{it.text}</Text>
                  <Text style={[s.statusBadge, { backgroundColor: st.bg, color: st.fg }]}>
                    {it.status ? FOLLOWUP_STATUS_LABELS[it.status] : 'No status set'}
                  </Text>
                </View>
                {it.status === 'not_done' || it.status === 'partial' ? (
                  <Text style={[s.itemMetaRow, { marginLeft: 13 }]}>
                    Reason: {it.reason || '—'}
                  </Text>
                ) : null}
              </View>
            )
          })}
        </View>
      )
    }
  }
}

export function ReportPdfDocument({ submission }: { submission: ReportSubmission }) {
  return (
    <Document title={`${submission.templateName} — ${submission.employeeName}`}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Image style={s.logo} src={LOGO_URL} />
            <Text style={s.tagline}>PLAN LESS, CELEBRATE MORE</Text>
          </View>
          <View style={s.companyBlock}>
            <Text style={s.companyName}>OpusFesta Company Limited</Text>
            <Text>Samaki Wabichi Annex, Mbezi Beach,</Text>
            <Text>P.O.Box 7787 Dar es Salaam, Tanzania</Text>
            <Text>info@opusfesta.com | www.opusfesta.com</Text>
          </View>
        </View>

        <Text style={s.title}>{submission.templateName}</Text>
        <View style={s.meta}>
          <Text>
            <Text style={s.metaLabel}>Date: </Text>
            {formatLongDate(submission.reportDate)}
            {submission.periodEnd ? ` – ${formatLongDate(submission.periodEnd)}` : ''}
          </Text>
          <Text>
            <Text style={s.metaLabel}>Prepared by: </Text>
            {submission.preparedByName ?? submission.employeeName}
            {submission.preparedByRole ? ` — ${submission.preparedByRole}` : ''}
          </Text>
          {submission.recipientName ? (
            <Text>
              <Text style={s.metaLabel}>Submitted to: </Text>
              {submission.recipientName}
            </Text>
          ) : null}
        </View>

        {submission.sections.map((section, i) => (
          <View key={section.id} style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>
              {i + 1}. {section.title}
            </Text>
            <SectionBody section={section} submission={submission} />
          </View>
        ))}

        <View style={s.letterhead} fixed>
          <View style={s.lhCols}>
            <View style={s.lhBlock}>
              <Text style={s.lhName}>OpusFesta Company Limited</Text>
              <Text>Samaki Wabichi Annex, Mbezi Beach</Text>
              <Text>P.O.Box 7787 Dar es Salaam, Tanzania</Text>
            </View>
            <View style={[s.lhBlock, s.lhContact]}>
              <Text style={s.lhName}>www.opusfesta.com</Text>
              <Text>info@opusfesta.com | +255 799 242 475</Text>
            </View>
          </View>
          <View style={s.lhBar} />
        </View>
      </Page>
    </Document>
  )
}

export async function renderReportPdfBuffer(submission: ReportSubmission): Promise<Buffer> {
  return renderToBuffer(
    createElement(ReportPdfDocument, { submission }) as ReactElement<DocumentProps>,
  )
}
