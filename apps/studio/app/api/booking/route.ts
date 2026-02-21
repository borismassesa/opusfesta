import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, eventType } = body;

    if (!name || !email || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and event type are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const { phone, preferredDate, location, service, message } = body;

    // Send notification to studio
    const studioHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F9FA; border: 4px solid #171717;">
        <div style="background: #171717; padding: 24px 32px;">
          <h1 style="color: #fff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">NEW BOOKING ENQUIRY</h1>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #7E7383; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Name</td><td style="padding: 8px 0; font-size: 15px; color: #171717;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #7E7383; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Email</td><td style="padding: 8px 0; font-size: 15px; color: #171717;"><a href="mailto:${email}" style="color: #6F3393;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #7E7383; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Phone</td><td style="padding: 8px 0; font-size: 15px; color: #171717;">${phone}</td></tr>` : ''}
            <tr><td style="padding: 8px 0; color: #7E7383; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Event Type</td><td style="padding: 8px 0; font-size: 15px; color: #171717;">${eventType}</td></tr>
            ${preferredDate ? `<tr><td style="padding: 8px 0; color: #7E7383; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Preferred Date</td><td style="padding: 8px 0; font-size: 15px; color: #171717;">${preferredDate}</td></tr>` : ''}
            ${location ? `<tr><td style="padding: 8px 0; color: #7E7383; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Location</td><td style="padding: 8px 0; font-size: 15px; color: #171717;">${location}</td></tr>` : ''}
            ${service ? `<tr><td style="padding: 8px 0; color: #7E7383; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Service</td><td style="padding: 8px 0; font-size: 15px; color: #171717;">${service}</td></tr>` : ''}
          </table>
          ${message ? `<div style="margin-top: 20px; padding: 16px; background: #fff; border: 2px solid #171717;"><p style="margin: 0; font-size: 14px; color: #171717; line-height: 1.6;">${message}</p></div>` : ''}
        </div>
      </div>
    `;

    await sendEmail({
      to: 'studio@opusfesta.com',
      subject: `New Booking: ${eventType} — ${name}`,
      html: studioHtml,
      replyTo: email,
    });

    // Send confirmation to customer
    const confirmHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F9FA; border: 4px solid #171717;">
        <div style="background: #171717; padding: 24px 32px;">
          <h1 style="color: #fff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">OPUSFESTA STUDIO</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="font-size: 24px; font-weight: 800; color: #171717; letter-spacing: -0.5px; margin: 0 0 16px;">Thanks, ${name}.</h2>
          <p style="font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 24px;">We&rsquo;ve received your booking enquiry and will be in touch within 24 hours to discuss your ${eventType.toLowerCase()} in detail.</p>
          <div style="padding: 16px; background: #fff; border: 2px solid #171717;">
            <p style="margin: 0; font-size: 13px; color: #7E7383;">In the meantime, feel free to reply to this email with any additional details, inspiration, or questions.</p>
          </div>
          <p style="margin-top: 32px; font-size: 12px; color: #999;">&mdash; The OpusFesta Studio Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `We've received your enquiry — OpusFesta Studio`,
      html: confirmHtml,
      replyTo: 'studio@opusfesta.com',
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[BOOKING API] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
