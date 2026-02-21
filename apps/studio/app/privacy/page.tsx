import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | OpusFesta Studio',
  description: 'How we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <PageLayout>
      <section className="py-24 bg-brand-bg">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
            Legal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-dark leading-[0.9] mb-12">
            PRIVACY<br />
            <span className="text-stroke">POLICY.</span>
          </h1>

          <div className="space-y-8 text-neutral-600 font-light leading-relaxed">
            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">1. Information We Collect</h2>
              <p>When you contact us through our booking form, we collect your name, email address, phone number, event details, and any additional information you provide in your message. We also collect standard web analytics data such as page views and referral sources.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">2. How We Use Your Information</h2>
              <p>We use your personal information to respond to enquiries, manage bookings, deliver our services, send booking confirmations, and communicate about your project. We do not sell or share your personal information with third parties for marketing purposes.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">3. Email Communications</h2>
              <p>When you submit a booking enquiry, you will receive an automatic confirmation email. We may also send you project-related communications. You can opt out of non-essential emails at any time by contacting us directly.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">4. Data Storage & Security</h2>
              <p>Your data is stored securely using industry-standard encryption and security practices. We use trusted third-party services (including email delivery and hosting providers) that maintain their own security and privacy standards.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">5. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information at any time. To exercise these rights, please contact us at studio@opusfesta.com.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">6. Contact</h2>
              <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:studio@opusfesta.com" className="text-brand-accent hover:underline">studio@opusfesta.com</a>.</p>
            </div>

            <p className="text-sm text-neutral-400 font-mono pt-4 border-t-2 border-brand-border">
              Last updated: February 2026
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
