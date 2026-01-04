import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
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

  try {
    console.log('[EMAIL] Attempting to send email', {
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      from: options.from || 'TheFesta <noreply@thefesta.com>',
    });

    const result = await resend.emails.send({
      from: options.from || 'TheFesta <noreply@thefesta.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
    });

    if (result.error) {
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
