import 'server-only'
import type { SmsLinkSend, SmsProvider, SmsSendResult } from './types'

// Dry-run provider used until an SMS gateway (e.g. Africa's Talking, Twilio)
// is wired up. Mirrors the WhatsApp stub so the send pipeline (contact
// picker, message log, dashboard UI) is testable end to end before an
// account exists. Never makes a network call.
export class StubSmsProvider implements SmsProvider {
  readonly name = 'stub'
  readonly live = false

  async sendLinkRequest(send: SmsLinkSend): Promise<SmsSendResult> {
    console.warn('[sms:stub] would send pledge link request', {
      to: send.to,
      contact: send.contactFirstName,
      link: send.link,
    })
    return { ok: true, dryRun: true }
  }
}
