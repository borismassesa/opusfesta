import 'server-only'
import { readFileSync } from 'node:fs'
import path from 'node:path'

// OpusFesta — Mkataba wa Ushirikiano na Mtoa Huduma (Vendor Agreement v002)
//
// Document of record: OF-LGL-AGR-002, effective April 2026.
// The full body lives alongside this module in `vendor-agreement.md` so the
// legal text isn't shipped to every client bundle by default — server pages
// read it and pass the body down only where it's actually rendered.
//
// VENDOR_AGREEMENT_VERSION is the canonical identifier persisted into the
// vendor_agreements row each time a vendor signs. Bump this whenever the
// terms change materially; the existing signed rows remain valid as proof
// of what each vendor agreed to (the audit trail records the SHA-256 of the
// exact body at signing time).

export const VENDOR_AGREEMENT_VERSION = 'OF-LGL-AGR-002.2026-04'

/**
 * Public URL for the canonical PDF of the agreement, served from
 * apps/vendors_portal/public/legal/. Vendors read the PDF directly via the
 * browser's native viewer for pixel-perfect fidelity with the legal source
 * document; the .md body in this folder is kept for the SHA-256 audit hash
 * recorded against each signature, since the PDF binary changes whenever
 * regenerated even with identical text.
 */
export const VENDOR_AGREEMENT_PDF_URL = '/legal/opusfesta-vendor-agreement.pdf'

let cached: string | null = null

/**
 * Returns the canonical agreement body. Server-only — calling this from a
 * client component will throw thanks to `import 'server-only'` above.
 *
 * The file is read once per server process and cached for the rest of the
 * lifetime; the agreement is large enough (~67KB) that we don't want to
 * re-read it on every request, but small enough that a single in-memory
 * cache is fine.
 */
export function getVendorAgreement(): string {
  if (cached !== null) return cached
  cached = readFileSync(
    path.join(process.cwd(), 'src/lib/onboarding/vendor-agreement.md'),
    'utf-8',
  )
  return cached
}
