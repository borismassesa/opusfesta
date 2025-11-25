import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../../app/home-data';

const CategoryBar = () => {
  return (
    <div className="w-full bg-transparent">
      <div className="mx-auto grid h-14 max-w-[1400px] grid-cols-[auto,1fr,auto] items-center gap-3 px-4 sm:px-6 md:h-16">
        <div className="hidden md:flex">
          <button
            type="button"
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 dark:border-slate-700 dark:bg-[#0f1116] dark:text-slate-200"
          >
            Following <ChevronDown size={14} />
          </button>
        </div>

        <div className="mask-linear-gradient no-scrollbar min-w-0 overflow-x-auto">
          <div className="flex items-center justify-start gap-2 px-2 sm:justify-center">
            {CATEGORIES.map((category, index) => (
              <a
                key={category}
                href="#"
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  index === 0
                    ? 'bg-gray-200 text-gray-900 dark:bg-slate-800 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
              >
                {category}
              </a>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 dark:border-slate-700 dark:bg-[#0f1116] dark:text-slate-200"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
