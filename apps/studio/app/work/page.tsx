import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { STUDIO_PROJECTS } from "@/lib/studio-content";

export const metadata: Metadata = {
  title: "Work | OpusFesta Studio",
  description: "Signature wedding, event, and commercial projects by OpusFesta Studio.",
};

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <section className="pt-28 pb-12 border-b-4 border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
            Portfolio
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            SIGNATURE
            <br />
            WORK.
          </h1>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-10 lg:space-y-14">
          {STUDIO_PROJECTS.map((project) => (
            <article key={project.slug} className="grid grid-cols-1 lg:grid-cols-[420px_1fr] border-4 border-brand-border bg-brand-bg">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[320px] border-b-4 lg:border-b-0 lg:border-r-4 border-brand-border">
                <Image src={project.image} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
              </div>
              <div className="p-8 lg:p-10">
                <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest mb-3">{project.category}</p>
                <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter text-brand-dark leading-[1] mb-4">{project.title}</h2>
                <p className="text-neutral-600 text-base lg:text-lg font-light leading-relaxed max-w-2xl mb-8">{project.description}</p>
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
                >
                  View Case Study
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
