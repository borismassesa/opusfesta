'use server'

import { verifyCaptureToken } from '@/lib/capture-token'
import {
  MAX_DATA_URL_CHARS,
  storeVerificationShot,
  type CaptureKind,
} from '@/lib/verification'

// Public (unauthenticated) upload used by the phone-capture page. Authorization
// comes entirely from the signed capture token, which scopes the upload to one
// vendor for ~15 minutes — the phone never signs in.

export type CaptureUploadResult = { ok: true } | { ok: false; error: string }

export async function uploadCapturedNationalId(
  token: string,
  kind: CaptureKind,
  dataUrl: string,
): Promise<CaptureUploadResult> {
  // This route is public (no Clerk session). Reject an oversized payload by
  // raw string length BEFORE verifying the token or decoding base64, so a
  // valid/replayed token can't drive unauthenticated memory exhaustion.
  if (typeof dataUrl !== 'string' || dataUrl.length > MAX_DATA_URL_CHARS) {
    return { ok: false, error: 'Photo is too large — please retake it.' }
  }
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
