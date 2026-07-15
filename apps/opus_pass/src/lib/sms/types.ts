/** Result of an SMS send attempt. */
export interface SmsSendResult {
  ok: boolean
  error?: string
  /** True when handled by the dry-run stub (no live gateway yet). */
  dryRun?: boolean
}

/** A pledge-link nudge sent by text message. */
export interface SmsLinkSend {
  to: string
  contactFirstName: string
  coupleName: string
  /** Absolute pledge URL to include in the message body. */
  link: string
}

export interface SmsProvider {
  readonly name: string
  /** True when a real gateway is configured (else dry-run stub). */
  readonly live: boolean
  sendLinkRequest(send: SmsLinkSend): Promise<SmsSendResult>
  /** Free-form text — used for reminder nudges, whose content (owing amount,
   *  due date) varies per pledge and doesn't fit the fixed link-request shape. */
  sendText(to: string, body: string): Promise<SmsSendResult>
}
