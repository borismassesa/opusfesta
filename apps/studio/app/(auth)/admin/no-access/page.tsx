import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { BsExclamationTriangle } from 'react-icons/bs';

export default async function StudioAdminNoAccessPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/studio-admin/sign-in');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-bg text-brand-dark">
      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
        <section className="w-full border border-brand-dark bg-white p-8 shadow-brutal-md sm:p-10">
          <div className="inline-flex items-center gap-2 border border-brand-dark/15 bg-brand-accent/10 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.25em]">
            <BsExclamationTriangle className="h-4 w-4 text-brand-accent" />
            Access restricted
          </div>

          <h1 className="mt-5 text-3xl font-semibold uppercase tracking-[-0.03em] sm:text-4xl">
            Your account is signed in, but not authorized for Studio Admin.
          </h1>

          <p className="mt-4 text-sm leading-7 text-brand-muted sm:text-base">
            This workspace requires a Clerk public metadata role: <span className="font-mono text-brand-dark">studio_role</span>.
            Ask an admin to assign one of: <span className="font-mono text-brand-dark">studio_viewer</span>,{' '}
            <span className="font-mono text-brand-dark">studio_editor</span>, or{' '}
            <span className="font-mono text-brand-dark">studio_admin</span>.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/studio-admin/sign-in"
              className="inline-flex items-center border border-brand-dark bg-brand-dark px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-brand-accent hover:border-brand-accent hover:shadow-none shadow-[4px_4px_0px_0px_rgba(23,23,23,0.28)]"
            >
              Switch account
            </Link>
            <Link
              href="/"
              className="inline-flex items-center border border-brand-dark/15 bg-brand-panel px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark transition-colors hover:border-brand-accent hover:text-brand-accent"
            >
              Go to studio home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
