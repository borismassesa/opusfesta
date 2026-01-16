export function getVerificationCodeEmailHtml(code: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Verify Your Email - OpusFesta</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      body, .body-bg { background-color: #0b0b0c !important; }
      .card { background-color: #111113 !important; box-shadow: none !important; }
      .header { background: #111113 !important; border-bottom-color: #222225 !important; }
      .text-main { color: #f5f5f5 !important; }
      .text-muted { color: #d4d4d8 !important; }
      .text-subtle { color: #a1a1aa !important; }
      .border-light { border-color: #222225 !important; }
      .code-box { background: #0f0f11 !important; border-color: #2a2a30 !important; }
      .note { background-color: #0f0f11 !important; border-left-color: #f5f5f5 !important; }
      .footer { background-color: #0f0f11 !important; border-top-color: #222225 !important; }
    }
    /* Outlook.com and legacy dark-mode selectors */
    [data-ogsc] body, [data-ogsc] .body-bg { background-color: #0b0b0c !important; }
    [data-ogsc] .card { background-color: #111113 !important; box-shadow: none !important; }
    [data-ogsc] .header { background: #111113 !important; border-bottom-color: #222225 !important; }
    [data-ogsc] .text-main { color: #f5f5f5 !important; }
    [data-ogsc] .text-muted { color: #d4d4d8 !important; }
    [data-ogsc] .text-subtle { color: #a1a1aa !important; }
    [data-ogsc] .border-light { border-color: #222225 !important; }
    [data-ogsc] .code-box { background: #0f0f11 !important; border-color: #2a2a30 !important; }
    [data-ogsc] .note { background-color: #0f0f11 !important; border-left-color: #f5f5f5 !important; }
    [data-ogsc] .footer { background-color: #0f0f11 !important; border-top-color: #222225 !important; }
  </style>
</head>
<body class="body-bg" bgcolor="#fafafa" style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table role="presentation" class="body-bg" bgcolor="#fafafa" style="width: 100%; border-collapse: collapse; background-color: #fafafa;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" class="card" bgcolor="#ffffff" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td class="header border-light" style="padding: 48px 48px 32px; text-align: center; background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%); border-bottom: 1px solid #f0f0f0;">
              <h1 class="text-main" style="margin: 0; font-size: 36px; font-weight: 400; color: #050505; font-family: 'Pacifico', cursive; letter-spacing: 0.05em; line-height: 1.2;">
                OpusFesta
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px;">
              <h2 class="text-main" style="margin: 0 0 16px; font-size: 28px; font-weight: 600; color: #050505; line-height: 1.3; letter-spacing: -0.02em;">
                Verify Your Email Address
              </h2>
              
              <p class="text-muted" style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b;">
                Thank you for signing up for OpusFesta! To complete your registration, please enter the verification code below:
              </p>
              
              <!-- Verification Code Box -->
              <div class="code-box border-light" style="background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%); border: 2px solid #e5e5e5; border-radius: 12px; padding: 40px 32px; text-align: center; margin: 32px 0;">
                <p class="text-subtle" style="margin: 0 0 20px; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                  Your Verification Code
                </p>
                <div class="text-main" style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #050505; font-family: 'Courier New', 'Monaco', monospace; line-height: 1.2;">
                  ${code}
                </div>
              </div>
              
              <div class="note" style="background-color: #fafafa; border-left: 4px solid #050505; border-radius: 8px; padding: 20px; margin: 32px 0;">
                <p class="text-muted" style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #52525b; font-weight: 500;">
                  ⏱️ This code will expire in <strong class="text-main" style="color: #050505;">10 minutes</strong>
                </p>
                <p class="text-subtle" style="margin: 0; font-size: 14px; line-height: 1.5; color: #888888;">
                  If you didn't request this code, please ignore this email.
                </p>
              </div>
              
              <div class="border-light" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f0f0f0;">
                <p class="text-subtle" style="margin: 0; font-size: 13px; line-height: 1.6; color: #888888;">
                  <strong class="text-muted" style="color: #52525b;">Security reminder:</strong> Never share this code with anyone. OpusFesta will never ask for your verification code via phone or email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer border-light" style="padding: 32px 48px; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
              <p class="text-muted" style="margin: 0 0 8px; font-size: 14px; color: #52525b; text-align: center; line-height: 1.5;">
                This email was sent to <strong class="text-main" style="color: #050505;">${email}</strong>
              </p>
              <p class="text-subtle" style="margin: 16px 0 0; font-size: 12px; color: #888888; text-align: center; line-height: 1.5;">
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
