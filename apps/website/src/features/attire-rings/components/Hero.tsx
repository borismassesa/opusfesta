import React from 'react';
import { SafeImage } from './SafeImage';

const LEFT_SPLIT_IMAGE =
  'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=1200';
const RIGHT_CARD_IMAGE =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200';

export const Hero: React.FC = () => {
  return (
    <section className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 py-6">
      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-5 md:gap-6">
        <div className="rounded-2xl overflow-hidden border border-gray-300/70 shadow-sm bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1.1fr] min-h-[300px] lg:min-h-[360px]">
            <div className="bg-[#e7cbd3] px-8 py-10 md:px-14 md:py-12 flex flex-col justify-center">
              <h1 className="font-serif text-[#232127] text-4xl md:text-5xl leading-[1.05] tracking-tight max-w-2xl">
                Find your bridal look and perfect rings
              </h1>
              <div className="mt-8">
                <button className="bg-[#1f2329] text-white font-semibold text-base px-9 py-3.5 rounded-full hover:bg-black transition-colors">
                  Shop attire &amp; rings
                </button>
              </div>
            </div>

            <div className="relative min-h-[220px] md:min-h-full">
              <SafeImage
                src={LEFT_SPLIT_IMAGE}
                alt="Bridal gown detail"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[360px] border border-gray-300/70 shadow-sm">
          <SafeImage
            src={RIGHT_CARD_IMAGE}
            alt="Engagement and wedding rings"
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-7 text-white">
            <h2 className="font-semibold leading-tight text-4xl md:text-[2.4rem] max-w-[16ch]">
              Sparkle with rings made for your day
            </h2>
            <a href="/attireandrings" className="inline-block mt-3 text-2xl font-medium hover:underline">
              Shop now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
