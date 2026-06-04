'use server'

import { verifyCaptureToken } from '@/lib/capture-token'
import { storeVerificationShot, type CaptureKind } from '@/lib/verification'

// Public (unauthenticated) upload used by the phone-capture page. Authorization
// comes entirely from the signed capture token, which scopes the upload to one
// vendor for ~15 minutes — the phone never signs in.

export type CaptureUploadResult = { ok: true } | { ok: false; error: string }

export async function uploadCapturedNationalId(
  token: string,
  kind: CaptureKind,
  dataUrl: string,
): Promise<CaptureUploadResult> {
  const vendorId = verifyCaptureToken(token)
  if (!vendorId) {
    return {
      ok: false,
      error: 'This capture link has expired. Reopen it from your computer.',
    }
  }
  if (kind !== 'front' && kind !== 'back' && kind !== 'selfie') {
    return { ok: false, error: 'Invalid capture type.' }
  }
  return storeVerificationShot(vendorId, kind, dataUrl)
}
