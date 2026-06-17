import 'server-only'
import { BTN, type InviteSend, type SendResult, type WhatsAppProvider } from './types'

// Meta WhatsApp Cloud API provider. Sends business-initiated template messages
// with an image header + dynamic body + quick-reply buttons whose payloads
// carry the guest token. Swappable: implements the same WhatsAppProvider
// interface as the stub, so a future 360dialog/Twilio impl drops in here.

const GRAPH_VERSION = 'v21.0'

export interface MetaConfig {
  phoneNumberId: string
  accessToken: string
  templateName: string
  defaultLanguage: string
}

/** Returns Meta config when fully set, else null (→ caller falls back to stub). */
export function readMetaConfig(): MetaConfig | null {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME
  if (!phoneNumberId || !accessToken || !templateName) return null
  return {
    phoneNumberId,
    accessToken,
    templateName,
    defaultLanguage: process.env.WHATSAPP_TEMPLATE_LANG || 'sw',
  }
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'meta'
  readonly live = true
  private cfg: MetaConfig

  constructor(cfg: MetaConfig) {
    this.cfg = cfg
  }

  private endpoint(): string {
    return `https://graph.facebook.com/${GRAPH_VERSION}/${this.cfg.phoneNumberId}/messages`
  }

  private async post(body: unknown): Promise<SendResult> {
    try {
      const res = await fetch(this.endpoint(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cfg.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as {
        messages?: { id: string }[]
        error?: { message?: string }
      }
      if (!res.ok) {
        return { ok: false, error: json.error?.message || `HTTP ${res.status}` }
      }
      return { ok: true, wamid: json.messages?.[0]?.id }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'network error' }
    }
  }

  async sendInvite(send: InviteSend): Promise<SendResult> {
    const payload = (kind: string) => `${kind}:${send.token}`
    return this.post({
      messaging_product: 'whatsapp',
      to: send.to,
      type: 'template',
      template: {
        name: this.cfg.templateName,
        language: { code: send.languageCode || this.cfg.defaultLanguage },
        components: [
          { type: 'header', parameters: [{ type: 'image', image: { link: send.headerImageUrl } }] },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: send.guestFirstName }, // {{1}}
              { type: 'text', text: send.coupleName }, // {{2}}
            ],
          },
          // Button labels ("Asante, Nitafika" / "Sitafika, Ninaudhuru" / "View
          // Location") are fixed in the approved template; only the payload (with
          // the guest token) is dynamic. See INVITE_TEMPLATE for the spec.
          { type: 'button', sub_type: 'quick_reply', index: '0', parameters: [{ type: 'payload', payload: payload(BTN.RSVP_YES) }] },
          { type: 'button', sub_type: 'quick_reply', index: '1', parameters: [{ type: 'payload', payload: payload(BTN.RSVP_NO) }] },
          { type: 'button', sub_type: 'quick_reply', index: '2', parameters: [{ type: 'payload', payload: payload(BTN.VIEW_LOCATION) }] },
        ],
      },
    })
  }

  async sendText(to: string, body: string): Promise<SendResult> {
    return this.post({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    })
  }
}
