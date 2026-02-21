import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STUDIO_PROJECTS } from "@/lib/studio-content";

type WorkDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = STUDIO_PROJECTS.find((item) => item.slug === slug);

  if (!project) {
    return {
      title: "Project Not Found | OpusFesta Studio",
    };
  }

  return {
    title: `${project.title} | OpusFesta Studio`,
    description: project.description,
  };
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const project = STUDIO_PROJECTS.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-brand-bg">
      <section className="pt-28 pb-12 border-b-4 border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <p className="text-[10px] font-mono text-brand-accent uppercase tracking-widest mb-4">{project.category}</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.95] max-w-5xl">
            {project.title}
          </h1>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="relative border-4 border-brand-border aspect-[16/9] mb-10">
            <Image src={project.image} alt={project.title} fill sizes="100vw" className="object-cover" priority />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-16">
            <div>
              <h2 className="text-2xl lg:text-4xl font-bold tracking-tight text-brand-dark mb-5">Project Story</h2>
              <p className="text-neutral-600 text-base lg:text-lg font-light leading-relaxed max-w-3xl">{project.story}</p>
            </div>
            <div className="border-4 border-brand-border p-6 h-max">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Project Number</p>
              <p className="text-3xl font-mono font-bold text-brand-dark mb-6">{project.number}</p>
              <Link
                href="/work"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-brand-dark text-white text-[11px] font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
              >
                Back to Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
