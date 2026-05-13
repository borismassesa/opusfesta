import { escapeHtml, plaintextLines, renderEmail } from './email-shell'

type Input = {
  name: string
  vendorsUrl: string
}

export function buildWelcomeEmail(input: Input) {
  const subject = 'Welcome to OpusFesta'

  const text = plaintextLines([
    `Hi ${input.name},`,
    '',
    'Welcome to OpusFesta. Your profile is ready and you can start discovering vendors now.',
    '',
    `Browse vendors: ${input.vendorsUrl}`,
  ])

  const html = renderEmail({
    heading: 'Welcome to OpusFesta',
    preheader: 'Your profile is ready. Start discovering vendors.',
    intro: `Hi <strong>${escapeHtml(input.name)}</strong>, welcome to OpusFesta. Your profile is complete and your planning dashboard is ready.`,
    rows: [
      { label: 'Next step', value: 'Explore vendors and send your first quote request' },
    ],
    cta: { href: input.vendorsUrl, label: 'Browse vendors' },
  })

  return { subject, text, html }
}
