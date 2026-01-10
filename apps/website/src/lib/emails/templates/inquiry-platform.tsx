interface InquiryPlatformEmailProps {
  inquiryId: string;
  vendorName: string;
  vendorId: string;
  customerName: string;
  customerEmail: string;
  eventType: string;
  eventDate?: string;
  baseUrl: string;
}

export function InquiryPlatformEmail({
  inquiryId,
  vendorName,
  vendorId,
  customerName,
  customerEmail,
  eventType,
  eventDate,
  baseUrl,
}: InquiryPlatformEmailProps): string {
  const inquiryUrl = `${baseUrl}/inquiries/${inquiryId}`;
  const vendorUrl = `${baseUrl}/vendors/${vendorId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry - Admin Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px; text-align: center;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">OpusFesta Admin</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">New Inquiry Created</h2>
              
              <p style="margin: 0 0 20px; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                A new inquiry has been submitted on the platform.
              </p>
              
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">Inquiry Summary</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px; width: 140px;">Inquiry ID:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500; font-family: monospace;">${inquiryId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Vendor:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${vendorName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Customer:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${customerName} (${customerEmail})</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Event Type:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${eventType}</td>
                  </tr>
                  ${eventDate ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Event Date:</td>
                    <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${new Date(eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Status:</td>
                    <td style="padding: 8px 0;">
                      <span style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #92400e; border-radius: 12px; font-size: 12px; font-weight: 600;">Pending</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inquiryUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin-right: 12px;">View Inquiry</a>
                <a href="${vendorUrl}" style="display: inline-block; padding: 14px 32px; background-color: #f8f9fa; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Vendor</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} OpusFesta. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
