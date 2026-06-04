import 'server-only'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// OpusFesta — Mkataba wa Ushirikiano na Mtoa Huduma (Vendor Agreement, the
// OF-LGL-AGR-002 family).
//
// The binding agreement a vendor signs during verification is not a single
// document — it's a contract plus two annexes, each signed independently:
//
//   1. OF-LGL-AGR-002    Mkataba wa Ushirikiano na Mtoa Huduma  (main contract)
//   2. OF-LGL-AGR-002-A  Masharti ya Kibiashara                 (Jedwali A —
//                        tume, bei na malipo / commission, pricing & payments)
//   3. OF-LGL-AGR-002-B  Maudhui, Ridhaa na Ulinzi wa Taarifa   (Jedwali B —
//                        content, consent & data protection)
//
// Each document is e-signed on its own and persisted as its own row in
// vendor_agreements, keyed by its `version`. Vendors must sign all three
// before advancing to admin review (see maybeTransitionToAdminReview).
//
// Each `version` is the canonical identifier persisted into the
// vendor_agreements.agreement_version column at sign time. Bump a document's
// version whenever its terms change materially; existing signed rows remain
// valid as proof of exactly what was agreed to (the audit trail records the
// SHA-256 of the body at signing time).

/** The page-3 / signature-block identification fields a document captures. */
export type AgreementFieldSet =
  // Main contract — the full SEHEMU B business identification table
  // (business name, TIN, address, contact person, email, phone, service type).
  | 'full'
  // Annexes A & B — the lighter SEHEMU B block (full name, business name,
  // position/Cheo, NIDA).
  | 'schedule'

export type AgreementDocId = 'main' | 'schedule_a' | 'schedule_b'

export type AgreementDoc = {
  id: AgreementDocId
  /** Persisted into vendor_agreements.agreement_version. */
  version: string
  /** Document reference code shown to the vendor (e.g. OF-LGL-AGR-002-A). */
  code: string
  /** Swahili title as printed on the document. */
  title: string
  /** Short English helper shown under the title. */
  subtitle: string
  /** Public URL of the canonical PDF in apps/vendors_portal/public/legal/. */
  pdfUrl: string
  /** Suggested filename for the download link. */
  downloadName: string
  /** Bundled .md body, read server-side for the SHA-256 audit hash + the
   *  iOS-Safari text fallback. Lives alongside this module. */
  bodyFile: string
  /** Which identification block the sign form collects. */
  fields: AgreementFieldSet
}

// Backwards-compatible export — the *main* contract's version. Older code and
// already-signed rows reference this exact string.
export const VENDOR_AGREEMENT_VERSION = 'OF-LGL-AGR-002.2026-04'

/** Public URL for the main contract PDF (kept for any direct importers). */
export const VENDOR_AGREEMENT_PDF_URL = '/legal/opusfesta-vendor-agreement.pdf'

/**
 * The full OF-LGL-AGR-002 document family, in signing order. The main
 * contract first, then the two annexes.
 */
export const AGREEMENT_DOCS: readonly AgreementDoc[] = [
  {
    id: 'main',
    version: VENDOR_AGREEMENT_VERSION,
    code: 'OF-LGL-AGR-002',
    title: 'Mkataba wa Ushirikiano na Mtoa Huduma',
    subtitle: 'Main partnership agreement',
    pdfUrl: VENDOR_AGREEMENT_PDF_URL,
    downloadName: 'OpusFesta_Mkataba_Watoa_Huduma.pdf',
    bodyFile: 'vendor-agreement.md',
    fields: 'full',
  },
  {
    id: 'schedule_a',
    version: 'OF-LGL-AGR-002-A.2026-04',
    code: 'OF-LGL-AGR-002-A',
    title: 'Masharti ya Kibiashara',
    subtitle: 'Schedule A · commission, pricing & payments',
    pdfUrl: '/legal/opusfesta-schedule-a-commercial-terms.pdf',
    downloadName: 'OpusFesta_Masharti_ya_Kibiashara.pdf',
    bodyFile: 'schedule-a-commercial-terms.md',
    fields: 'schedule',
  },
  {
    id: 'schedule_b',
    version: 'OF-LGL-AGR-002-B.2026-04',
    code: 'OF-LGL-AGR-002-B',
    title: 'Maudhui, Ridhaa na Ulinzi wa Taarifa',
    subtitle: 'Schedule B · content, consent & data protection',
    pdfUrl: '/legal/opusfesta-schedule-b-standards-protection.pdf',
    downloadName: 'OpusFesta_Viwango_na_Ulinzi.pdf',
    bodyFile: 'schedule-b-standards-protection.md',
    fields: 'schedule',
  },
] as const

/** Every version string in the family — the verification gate requires a
 *  signature against each one. */
export const ALL_AGREEMENT_VERSIONS: readonly string[] = AGREEMENT_DOCS.map(
  (d) => d.version,
)

export function getAgreementDoc(id: AgreementDocId): AgreementDoc {
  const doc = AGREEMENT_DOCS.find((d) => d.id === id)
  if (!doc) throw new Error(`[agreement] unknown document id: ${id}`)
  return doc
}

export function getAgreementDocByVersion(
  version: string,
): AgreementDoc | undefined {
  return AGREEMENT_DOCS.find((d) => d.version === version)
}

const bodyCache = new Map<string, string>()

/**
 * Returns a document's canonical body text. Server-only — calling this from a
 * client component throws thanks to `import 'server-only'` above.
 *
 * Each file is read once per server process and cached for the rest of its
 * lifetime; the bodies are large enough that we don't want to re-read them on
 * every request, but small enough that an in-memory cache is fine.
 */
export function getAgreementBody(id: AgreementDocId): string {
  const doc = getAgreementDoc(id)
  const cached = bodyCache.get(doc.bodyFile)
  if (cached !== undefined) return cached
  const body = readFileSync(
    path.join(process.cwd(), 'src/lib/onboarding', doc.bodyFile),
    'utf-8',
  )
  bodyCache.set(doc.bodyFile, body)
  return body
}

/**
 * Returns the main contract body. Kept for backwards compatibility with
 * existing callers; equivalent to `getAgreementBody('main')`.
 */
export function getVendorAgreement(): string {
  return getAgreementBody('main')
}
