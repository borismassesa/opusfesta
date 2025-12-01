import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CATEGORIES } from '../../app/home-data';

const CategoryBar = () => {
  return (
    <div className="w-full border-b border-gray-100 dark:border-slate-800">
      <div className="mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.slice(0, 10).map((vendorType, index) => (
              <Link
                key={vendorType}
                href={`/vendors?category=${encodeURIComponent(vendorType)}`}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  index === 0
                    ? 'bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {vendorType}
              </Link>
            ))}
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
            >
              View all vendors
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
