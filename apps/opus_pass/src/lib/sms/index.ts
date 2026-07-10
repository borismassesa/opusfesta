import 'server-only'
import { StubSmsProvider } from './stub'
import type { SmsProvider } from './types'

export type { SmsProvider, SmsLinkSend, SmsSendResult } from './types'

/**
 * Returns the live SMS provider once a gateway is configured, else the
 * dry-run stub. No gateway exists yet — always the stub for now. Swap this
 * for a real provider (e.g. Africa's Talking) the same way
 * `getWhatsAppProvider` swaps in `MetaWhatsAppProvider` once WhatsApp
 * credentials are set — callers never change.
 */
export function getSmsProvider(): SmsProvider {
  return new StubSmsProvider()
}
