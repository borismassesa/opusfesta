import Image from 'next/image';
import { EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { MOCK_SHOTS } from '../../app/home-data';

const ShotGrid = () => {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_SHOTS.slice(0, 8).map(shot => (
          <div key={shot.id} className="flex flex-col gap-3">
            <article className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900/60 dark:ring-slate-800">
              <Image
                src={shot.image}
                alt={shot.title}
                fill
                sizes="(min-width: 1280px) 24vw, (min-width: 768px) 48vw, 100vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority={false}
              />
            </article>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Image
                  src={`https://picsum.photos/seed/${shot.id}/48/48`}
                  alt={shot.author}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{shot.author}</span>
                <span className="rounded bg-gray-200 px-1.5 text-[10px] font-bold uppercase text-gray-500 dark:bg-slate-800 dark:text-slate-200">
                  Pro
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <HeartIcon className="h-3.5 w-3.5 text-gray-400 dark:text-slate-300" />
                  {shot.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <EyeIcon className="h-3.5 w-3.5" />
                  {(shot.views ?? 0) / 1000}k
                </span>
              </div>
            </div>
            <div className="px-1">
              <p className="text-sm text-gray-600 line-clamp-1 dark:text-slate-300">{shot.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShotGrid;
