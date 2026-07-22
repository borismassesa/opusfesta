import 'server-only'
import QRCode from 'qrcode'
import { signEntryPassToken } from './tokens'

/** Render a guest's entry-pass QR as a PNG data URL for the given (guest, event) invitation. */
export async function generateEntryPassQrDataUrl(guestContactId: string, invitationId: string): Promise<string> {
  const token = signEntryPassToken({ guestContactId, invitationId })
  // Deep purple on white — stays on-brand for the purple ticket artwork while
  // keeping the dark-on-light contrast scanners require (never invert it).
  return QRCode.toDataURL(token, { margin: 1, width: 512, errorCorrectionLevel: 'M', color: { dark: '#4A2472', light: '#FFFFFF' } })
}
