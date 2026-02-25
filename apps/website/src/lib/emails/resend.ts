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

// Get the default from address, using environment variable or fallback to thefestaevents.com
function getDefaultFromAddress(): string {
  // Allow override via environment variable
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }

  // Use the Resend test sender in non-production when no override is set.
  if (process.env.NODE_ENV !== 'production') {
    return RESEND_FALLBACK_FROM;
  }

  // Use verified custom domain sender in production.
  return 'OpusFesta <noreply@thefestaevents.com>';
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    const errorMsg = 'Resend is not configured. RESEND_API_KEY is missing. Email not sent.';
    console.error('[EMAIL]', errorMsg, { subject: options.subject, to: options.to });
    return { success: false, error: 'Email service not configured - RESEND_API_KEY is missing' };
  }

  if (!process.env.RESEND_API_KEY) {
    const errorMsg = 'RESEND_API_KEY environment variable is not set';
    console.error('[EMAIL]', errorMsg);
    return { success: false, error: errorMsg };
  }

  const fromAddress = options.from || getDefaultFromAddress();
  const canUseFallbackFrom = process.env.NODE_ENV !== 'production' && !options.from;

  try {
    console.log('[EMAIL] Attempting to send email', {
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
      reply_to: options.replyTo,
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
          console.log('[EMAIL] Email sent successfully with fallback sender', {
            id: fallbackResult.data?.id,
            to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
          });
          return { success: true };
        }
        console.error('[EMAIL] Fallback sender API error:', {
          error: fallbackResult.error,
          message: fallbackResult.error.message,
          name: fallbackResult.error.name,
        });
        return { success: false, error: fallbackResult.error.message || 'Failed to send email' };
      }
      console.error('[EMAIL] Resend API error:', {
        error: result.error,
        message: result.error.message,
        name: result.error.name,
      });
      return { success: false, error: result.error.message || 'Failed to send email' };
    }

    console.log('[EMAIL] Email sent successfully', {
      id: result.data?.id,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL] Exception while sending email:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    return { success: false, error: error.message || 'Unknown error' };
  }
}
