import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CATEGORIES } from '../../app/home-data';

const CategoryBar = () => {
  return (
    <div className="w-full border-b border-slate-100 dark:border-slate-800">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-6 md:h-[70px]">
        <div className="flex items-center gap-1.5">
          {CATEGORIES.slice(0, 7).map((category, index) => (
            <Link
              key={category}
              href={`/inspiration?category=${encodeURIComponent(category)}`}
              className={`flex-shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                index === 0
                  ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              {category}
            </Link>
          ))}
        </div>

        <div className="flex-shrink-0">
          <Link
            href="/inspiration"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
          >
            View all inspiration
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
