import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const RESEND_FALLBACK_FROM = 'OpusFesta <onboarding@resend.dev>';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

function getDefaultFromAddress(): string {
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }
  if (process.env.NODE_ENV !== 'production') {
    return RESEND_FALLBACK_FROM;
  }
  return 'OpusFesta Studio <noreply@thefestaevents.com>';
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('[EMAIL]', 'Resend not configured. RESEND_API_KEY missing.', { subject: options.subject, to: options.to });
    return { success: false, error: 'Email service not configured' };
  }

  const fromAddress = options.from || getDefaultFromAddress();
  const canUseFallbackFrom = process.env.NODE_ENV !== 'production' && !options.from;

  try {
    console.log('[EMAIL] Sending:', {
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      from: fromAddress,
    });

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const payload = {
      from: fromAddress,
      to: recipients,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    };
    const result = await resend.emails.send(payload);

    if (result.error) {
      const isUnverifiedDomainError = result.error.message
        ?.toLowerCase()
        .includes('domain is not verified');
      if (isUnverifiedDomainError && canUseFallbackFrom && fromAddress !== RESEND_FALLBACK_FROM) {
        console.warn(
          '[EMAIL] Retrying with Resend fallback sender for development:',
          RESEND_FALLBACK_FROM
        );
        const fallbackResult = await resend.emails.send({
          ...payload,
          from: RESEND_FALLBACK_FROM,
        });
        if (!fallbackResult.error) {
          console.log('[EMAIL] Sent with fallback sender:', { id: fallbackResult.data?.id });
          return { success: true };
        }
        console.error('[EMAIL] Fallback API error:', fallbackResult.error);
        return { success: false, error: fallbackResult.error.message || 'Failed to send email' };
      }
      console.error('[EMAIL] API error:', result.error);
      return { success: false, error: result.error.message || 'Failed to send email' };
    }

    console.log('[EMAIL] Sent:', { id: result.data?.id });
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EMAIL] Exception:', message);
    return { success: false, error: message };
  }
}
