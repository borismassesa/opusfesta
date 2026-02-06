"use client";

import { cn } from "@/lib/utils";

type Logo = {
  image: string;
  alt: string;
};

type LogoColumn = {
  logos: Logo[];
  className?: string;
};

const LogoCloud = ({ logoColumns }: { logoColumns: LogoColumn[] }) => {
  return (
    <section className="py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-12 max-xl:flex-col sm:gap-16 lg:gap-24 xl:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">Trusted by Over 10,000 Leading Brands</h2>
            <p className="text-muted-foreground text-xl">
              These industry giants rely on our services to create high-converting landing pages.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 max-sm:flex-col">
            {logoColumns.map((column, index) => (
              <div key={index} className={cn("flex gap-4", column.className)}>
                {column.logos.map((logo, logoIndex) => (
                  <div
                    key={logoIndex}
                    className="bg-card flex w-32 items-center justify-center rounded-[12px] px-1.5 py-6 shadow-[6px_4px_32px_0_color-mix(in_oklab,var(--shadow-color)20%,transparent)] max-md:w-[6.75rem] max-sm:py-5"
                  >
                    <img src={logo.image} alt={logo.alt} className="h-[1.375rem] w-auto shrink-0 max-md:h-5" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoCloud;
