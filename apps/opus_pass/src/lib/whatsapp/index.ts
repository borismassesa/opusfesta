import 'server-only'
import crypto from 'node:crypto'
import { MetaWhatsAppProvider, readMetaConfig } from './meta'
import { StubWhatsAppProvider } from './stub'
import { BTN, type ButtonKind, type InboundButton, type WhatsAppProvider } from './types'

export type { WhatsAppProvider, InviteSend, SendResult, InboundButton, ButtonKind } from './types'
export { BTN } from './types'

/** Returns the live Meta provider when credentials are set, else the dry-run stub. */
export function getWhatsAppProvider(): WhatsAppProvider {
  const cfg = readMetaConfig()
  return cfg ? new MetaWhatsAppProvider(cfg) : new StubWhatsAppProvider()
}

/** The token the Meta webhook GET handshake must echo. */
export function webhookVerifyToken(): string | undefined {
  return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
}

/** The Meta app secret used to sign inbound webhook POSTs (X-Hub-Signature-256). */
export function webhookAppSecret(): string | undefined {
  return process.env.WHATSAPP_APP_SECRET
}

/**
 * Verify Meta's `X-Hub-Signature-256` header against the raw request body using
 * the app secret. The signature is `sha256=<hex>` of an HMAC-SHA256 over the
 * exact bytes Meta sent — so the caller MUST pass the unparsed body string.
 *
 * When no app secret is configured (local dev / dry-run before go-live) this
 * returns true so the pipeline stays testable; once WHATSAPP_APP_SECRET is set
 * in production, every unsigned or mismatched POST is rejected.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = webhookAppSecret()
  if (!secret) return true // not configured → don't block dev/dry-run traffic
  if (!signature) return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  // Length-guard before timingSafeEqual (it throws on unequal-length buffers).
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

/** A parsed outbound-message status update from the webhook. */
export interface InboundStatus {
  /** wamid of the OUTBOUND message this status refers to. */
  wamid: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  /** Meta error detail, present on failed statuses (e.g. undeliverable number). */
  error: string | null
}

const STATUS_VALUES = ['sent', 'delivered', 'read', 'failed'] as const

/**
 * Parse Meta webhook `statuses` events — the delivery lifecycle of messages WE
 * sent (sent → delivered → read, or failed). Without these a message that Meta
 * accepted but could not deliver (bad number, policy drop) looks "sent"
 * forever; with them the log carries the real outcome and read receipts.
 */
export function parseStatusUpdates(body: unknown): InboundStatus[] {
  const out: InboundStatus[] = []
  const entries = (body as { entry?: unknown[] })?.entry
  if (!Array.isArray(entries)) return out

  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes
    if (!Array.isArray(changes)) continue
    for (const change of changes) {
      const statuses = (change as { value?: { statuses?: unknown[] } })?.value?.statuses
      if (!Array.isArray(statuses)) continue
      for (const s of statuses as Record<string, unknown>[]) {
        const wamid = typeof s.id === 'string' ? s.id : null
        const status = typeof s.status === 'string' ? s.status : null
        if (!wamid || !status || !STATUS_VALUES.includes(status as InboundStatus['status'])) continue
        const errors = s.errors as { code?: number; title?: string; message?: string }[] | undefined
        const first = errors?.[0]
        const error = first
          ? [first.code, first.title || first.message].filter(Boolean).join(': ') || null
          : null
        out.push({ wamid, status: status as InboundStatus['status'], error })
      }
    }
  }
  return out
}

/** Split a button payload "kind:token:eventId" into its parts. `eventId` is
 *  absent on sends from before it was added — always handle it as optional. */
function parsePayload(
  payload: string | undefined | null,
): { kind: ButtonKind | null; token: string | null; eventId: string | null } {
  if (!payload) return { kind: null, token: null, eventId: null }
  const [kind, token, eventId] = payload.split(':')
  const known = Object.values(BTN).includes(kind as ButtonKind)
  return { kind: known ? (kind as ButtonKind) : null, token: token || null, eventId: eventId || null }
}

/**
 * Parse a Meta Cloud API webhook body into the button taps we care about.
 * Tolerant of shape drift: anything that isn't a recognised quick-reply is
 * ignored. Returns one InboundButton per actionable message.
 */
export function parseInboundButtons(body: unknown): InboundButton[] {
  const out: InboundButton[] = []
  const entries = (body as { entry?: unknown[] })?.entry
  if (!Array.isArray(entries)) return out

  for (const entry of entries) {
    const changes = (entry as { changes?: unknown[] })?.changes
    if (!Array.isArray(changes)) continue
    for (const change of changes) {
      const messages = (change as { value?: { messages?: unknown[] } })?.value?.messages
      if (!Array.isArray(messages)) continue
      for (const m of messages as Record<string, unknown>[]) {
        const from = typeof m.from === 'string' ? m.from : null
        const wamid = typeof m.id === 'string' ? m.id : null
        if (!from || !wamid) continue

        // Quick-reply taps arrive as interactive.button_reply or legacy button.
        let payload: string | undefined
        const interactive = m.interactive as { button_reply?: { id?: string } } | undefined
        if (interactive?.button_reply?.id) payload = interactive.button_reply.id
        const legacy = m.button as { payload?: string } | undefined
        if (!payload && legacy?.payload) payload = legacy.payload
        if (!payload) continue

        const { kind, token, eventId } = parsePayload(payload)
        if (!kind) continue
        out.push({ from, wamid, kind, token, eventId })
      }
    }
  }
  return out
}
