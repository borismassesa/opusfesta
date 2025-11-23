import type { CSSProperties } from 'react';

const stats = [
  { label: 'Event sites launched internally', value: '120+' },
  { label: 'Average setup time', value: '15 minutes' },
  { label: 'Payments', value: 'M-Pesa | Airtel | Tigo' },
  { label: 'Languages', value: 'Swahili + English' },
];

const features = [
  {
    title: 'Launch-ready templates',
    copy:
      'Next.js App Router with sections for story, schedule, venue maps, RSVP, and galleries. Ship as a static export to S3 or any CDN.',
    icon: 'UX',
  },
  {
    title: 'Bilingual by default',
    copy: 'Slots for Swahili and English copy so planners can toggle languages without touching code.',
    icon: 'A/B',
  },
  {
    title: 'Payments and registry',
    copy:
      'Link mobile money gift flows, add bank details, and drop in registry items as data. Ready for Airtel, M-Pesa, and Tigo flows.',
    icon: 'TZS',
  },
  {
    title: 'Analytics and SEO',
    copy: 'Meta tags, OpenGraph defaults, and PostHog/Sentry hooks to keep the marketing surface observable.',
    icon: 'SEO',
  },
];

const steps = [
  {
    title: 'Install and link workspaces',
    copy: 'From the repo root run npm install to fetch and link all workspace packages for the monorepo.',
    note: 'npm install',
  },
  {
    title: 'Develop locally',
    copy: 'Preview the marketing site alone or with the rest of the stack using Turbo filters.',
    note: 'npx turbo dev --filter=@thefesta/website',
  },
  {
    title: 'Export static site',
    copy: 'Build the static bundle that can go straight to S3, CloudFront, or any static host.',
    note: 'npm run build --workspace @thefesta/website',
  },
  {
    title: 'Deploy',
    copy: 'Upload the out directory to your bucket and wire CloudFront or a static host for the final domain.',
    note: 'output: /apps/website/out',
  },
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero__glow hero__glow--one" />
        <div className="hero__glow hero__glow--two" />
        <div className="hero__grid">
          <div>
            <span className="pill">
              <span className="pill__dot" />
              Event websites
            </span>
            <h1>Launch bilingual event websites from the same codebase</h1>
            <p className="lead">
              Build elegant, mobile-ready wedding pages with countdowns, RSVP, schedules, and vendor links. Export them
              statically and deploy to S3 or CloudFront without leaving the Festa monorepo.
            </p>
            <div className="hero__cta">
              <a className="btn btn--primary" href="#get-started">
                Build your site
              </a>
              <a className="btn btn--ghost" href="#features">
                See what is included
              </a>
            </div>
            <div className="hero__stats">
              {stats.map(stat => (
                <div className="stat" key={stat.label}>
                  <div className="stat__value">{stat.value}</div>
                  <div className="stat__label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero__panel">
            <div className="panel__header">
              <span>Deployment snapshot</span>
              <span className="panel__badge">Static export</span>
            </div>
            <div className="panel__card">
              <div className="panel__title">
                <span>RSVP + schedule</span>
                <span className="pill pill--success">Live</span>
              </div>
              <div className="progress" style={{ ['--value' as '--value']: '82%' } as CSSProperties}>
                <div className="progress__bar" />
              </div>
              <p className="panel__text">
                Story, schedule, registry, map embeds, and QR RSVPs ship in the template. Swap content without code
                changes.
              </p>
            </div>
            <div className="panel__card">
              <div className="panel__title">
                <span>Going live checklist</span>
                <span className="tag">S3 ready</span>
              </div>
              <ul className="panel__list">
                <li className="panel__item">
                  <span>Static export</span>
                  <span className="pill pill--neutral">out/</span>
                </li>
                <li className="panel__item">
                  <span>Custom domain</span>
                  <span className="tag">Route 53</span>
                </li>
                <li className="panel__item">
                  <span>CDN + SSL</span>
                  <span className="tag">CloudFront</span>
                </li>
              </ul>
            </div>
            <div className="panel__card">
              <div className="panel__title">
                <span>Bilingual content</span>
                <span className="tag">Sw/En</span>
              </div>
              <p className="panel__text">
                Copy blocks live in JSON so planners can localize hero, schedule, and vendor CTAs with predictable keys.
              </p>
              <ul className="panel__list">
                <li className="panel__item">
                  <span>Content tokens</span>
                  <span className="tag">/content</span>
                </li>
                <li className="panel__item">
                  <span>Theme</span>
                  <span className="tag">Shared styles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section feature-grid" id="features">
        <div className="section__header">
          <span className="pill">
            <span className="pill__dot" />
            What is included
          </span>
          <h2>Templates tuned for Tanzanian weddings</h2>
          <p>
            Keep the website experience in the same workspace as mobile and vendor apps. Reuse types, theme tokens, and
            deployment scripts instead of juggling separate repos.
          </p>
        </div>
        <div className="feature-grid__cards">
          {features.map(feature => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-card__icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="get-started">
        <div className="section__header">
          <span className="pill">
            <span className="pill__dot" />
            Build workflow
          </span>
          <h2>Ship the website from this monorepo</h2>
          <p>Use the same Turbo pipeline to develop, export, and deploy the static site without extra tooling.</p>
        </div>
        <ol className="steps__list">
          {steps.map((step, index) => (
            <li className="step" key={step.title}>
              <span className="step__badge">{index + 1}</span>
              <div>
                <p className="step__title">{step.title}</p>
                <p className="step__copy">{step.copy}</p>
              </div>
              <span className="step__note">{step.note}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-final">
        <span className="pill">
          <span className="pill__dot" />
          Ready to ship
        </span>
        <h3>Keep mobile, vendor, and website experiences aligned</h3>
        <p>
          Reuse types and visual language across Expo, the vendor portal, and statically exported event websites from a
          single codebase.
        </p>
        <div className="hero__cta" style={{ justifyContent: 'center' }}>
          <a className="btn btn--primary" href="#get-started">
            Start the website flow
          </a>
          <a className="btn btn--ghost" href="mailto:hello@thefesta.com">
            Talk to us
          </a>
        </div>
      </section>
    </main>
  );
}
