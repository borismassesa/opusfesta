import React from 'react';
import { Category } from '../types';
import { SafeImage } from './SafeImage';

interface SpecialGiftsGridProps {
  title: string;
  items: Category[];
  onCategoryClick?: (category: string) => void;
}

export const SpecialGiftsGrid: React.FC<SpecialGiftsGridProps> = ({ title, items, onCategoryClick }) => {
  return (
    <section className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 py-8">
      <h2 className="font-serif text-xl md:text-2xl text-gray-900 mb-6">{title}</h2>
      {/* Changed lg:grid-cols-5 to lg:grid-cols-6 to fit the 6 items requested by user */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 border border-gray-300 rounded-xl p-2 sm:pr-4 hover:shadow-md cursor-pointer transition-shadow bg-white sm:h-20 text-center sm:text-left"
            onClick={() => onCategoryClick?.(item.title)}
          >
            <div className="w-full sm:w-16 h-24 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
               <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <span className="font-medium text-xs sm:text-sm text-gray-900 leading-tight w-full sm:w-auto">{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
