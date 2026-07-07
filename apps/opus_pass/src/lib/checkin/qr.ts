import 'server-only'
import QRCode from 'qrcode'
import { signEntryPassToken } from './tokens'

/** Render a guest's entry-pass QR as a PNG data URL for the given (guest, event) invitation. */
export async function generateEntryPassQrDataUrl(guestContactId: string, invitationId: string): Promise<string> {
  const token = signEntryPassToken({ guestContactId, invitationId })
  return QRCode.toDataURL(token, { margin: 1, width: 320, errorCorrectionLevel: 'M' })
}
