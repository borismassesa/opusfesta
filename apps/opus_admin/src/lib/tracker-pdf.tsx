import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { DocumentProps } from '@react-pdf/renderer'

// Server-side PDF export of one week of the MD Daily Tracker — for handing
// the CEO's weekly review to someone outside the dashboard. Mirrors the
// letterhead used by report-pdf.tsx / invoice-pdf.tsx so all OpusFesta PDFs
// share one design.

const LOGO_URL = 'https://www.opusfesta.com/assets/logo/opusfesta-logo-black.png'
const ACCENT = '#6B4E8C'

export type TrackerPdfEntry = {
  topPriority: string
  otherTasks: string
  status: string | null
  blockers: string
  endOfDayNote: string
}

export type TrackerPdfEngine = {
  name: string
  mdNames: string[]
  days: Array<{ label: string; date: string; entry: TrackerPdfEntry | null }>
  review: { wins: string; carriedToNextWeek: string; ceoComment: string } | null
}

export type TrackerPdfWeek = {
  weekLabel: string
  weekStart: string
  engines: TrackerPdfEngine[]
}

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  Planned: { bg: '#f3f4f6', fg: '#6b7280' },
  'In Progress': { bg: '#fffbeb', fg: '#b45309' },
  Done: { bg: '#ecfdf5', fg: '#3f8b5c' },
  'Carried Over': { bg: '#F0DFF6', fg: '#5B2D8E' },
  Blocked: { bg: '#fef2f2', fg: '#b91c1c' },
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1a1a1a',
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 96,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingBottom: 12,
  },
  logo: { height: 30, width: 93 },
  tagline: { marginTop: 4, fontSize: 6, letterSpacing: 1.4, color: ACCENT, fontFamily: 'Helvetica-Bold' },
  companyBlock: { alignItems: 'flex-end', fontSize: 8, lineHeight: 1.5, color: '#4b5563' },
  companyName: { fontFamily: 'Helvetica-Bold', color: ACCENT },
  title: { marginTop: 18, fontSize: 15, fontFamily: 'Helvetica-Bold' },
  subtitle: { marginTop: 3, fontSize: 9, color: '#6b7280' },
  engineBlock: { marginTop: 16 },
  engineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 },
  engineName: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  engineMds: { fontSize: 8, color: '#6b7280' },
  dayRow: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, padding: 7, marginBottom: 5 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  dayLabel: { fontSize: 8.5, fontFamily: 'Helvetica-Bold' },
  statusPill: { fontSize: 7, fontFamily: 'Helvetica-Bold', paddingVertical: 1.5, paddingHorizontal: 6, borderRadius: 8 },
  fieldLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', marginTop: 3 },
  fieldValue: { fontSize: 8.5, color: '#1f2937' },
  empty: { fontSize: 8.5, color: '#9ca3af', fontStyle: 'italic' },
  reviewBox: { marginTop: 6, backgroundColor: '#FAF7FD', borderWidth: 1, borderColor: '#ECE3F5', borderRadius: 4, padding: 7 },
  reviewLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: ACCENT, textTransform: 'uppercase', marginTop: 3 },
  letterhead: { position: 'absolute', left: 40, right: 40, bottom: 24 },
  lhCols: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  lhBlock: { fontSize: 7, lineHeight: 1.5, color: '#6b7280', flex: 1 },
  lhName: { fontFamily: 'Helvetica-Bold', color: ACCENT },
  lhContact: { flex: 1, alignItems: 'flex-end' },
})

function DayEntry({ day }: { day: TrackerPdfEngine['days'][number] }) {
  const { entry } = day
  const color = entry?.status ? STATUS_COLOR[entry.status] : null
  return (
    <View style={s.dayRow} wrap={false}>
      <View style={s.dayHeader}>
        <Text style={s.dayLabel}>
          {day.label} · {day.date}
        </Text>
        {color ? (
          <Text style={[s.statusPill, { backgroundColor: color.bg, color: color.fg }]}>{entry!.status}</Text>
        ) : (
          <Text style={[s.statusPill, { backgroundColor: '#f3f4f6', color: '#9ca3af' }]}>Not started</Text>
        )}
      </View>
      {!entry || (!entry.topPriority && !entry.otherTasks && !entry.blockers && !entry.endOfDayNote) ? (
        <Text style={s.empty}>No entry logged.</Text>
      ) : (
        <>
          {entry.topPriority ? (
            <>
              <Text style={s.fieldLabel}>Top priority</Text>
              <Text style={s.fieldValue}>{entry.topPriority}</Text>
            </>
          ) : null}
          {entry.otherTasks ? (
            <>
              <Text style={s.fieldLabel}>Other tasks</Text>
              <Text style={s.fieldValue}>{entry.otherTasks}</Text>
            </>
          ) : null}
          {entry.blockers ? (
            <>
              <Text style={s.fieldLabel}>Blockers / needs from CEO</Text>
              <Text style={s.fieldValue}>{entry.blockers}</Text>
            </>
          ) : null}
          {entry.endOfDayNote ? (
            <>
              <Text style={s.fieldLabel}>End-of-day note</Text>
              <Text style={s.fieldValue}>{entry.endOfDayNote}</Text>
            </>
          ) : null}
        </>
      )}
    </View>
  )
}

export function TrackerPdfDocument({ week }: { week: TrackerPdfWeek }) {
  return (
    <Document title={`MD Daily Tracker — ${week.weekLabel}`}>
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

        <Text style={s.title}>MD Daily Tracker</Text>
        <Text style={s.subtitle}>Week of {week.weekLabel}</Text>

        {week.engines.map((engine) => (
          <View key={engine.name} style={s.engineBlock} wrap={false}>
            <View style={s.engineHeader}>
              <Text style={s.engineName}>{engine.name}</Text>
              <Text style={s.engineMds}>MD: {engine.mdNames.length ? engine.mdNames.join(', ') : 'none assigned'}</Text>
            </View>
            {engine.days.map((day) => (
              <DayEntry key={day.date} day={day} />
            ))}
            {engine.review && (engine.review.wins || engine.review.carriedToNextWeek || engine.review.ceoComment) ? (
              <View style={s.reviewBox}>
                {engine.review.wins ? (
                  <>
                    <Text style={s.reviewLabel}>Wins this week</Text>
                    <Text style={s.fieldValue}>{engine.review.wins}</Text>
                  </>
                ) : null}
                {engine.review.carriedToNextWeek ? (
                  <>
                    <Text style={s.reviewLabel}>Carried to next week</Text>
                    <Text style={s.fieldValue}>{engine.review.carriedToNextWeek}</Text>
                  </>
                ) : null}
                {engine.review.ceoComment ? (
                  <>
                    <Text style={s.reviewLabel}>CEO comment</Text>
                    <Text style={s.fieldValue}>{engine.review.ceoComment}</Text>
                  </>
                ) : null}
              </View>
            ) : null}
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
        </View>
      </Page>
    </Document>
  )
}

export async function renderTrackerPdfBuffer(week: TrackerPdfWeek): Promise<Buffer> {
  return renderToBuffer(createElement(TrackerPdfDocument, { week }) as ReactElement<DocumentProps>)
}
