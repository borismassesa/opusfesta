import React from 'react';
import { Category } from '../types';
import { SafeImage } from './SafeImage';

interface RoundCategoryGridProps {
  title: string;
  items: Category[];
  onCategoryClick?: (category: string) => void;
}

export const RoundCategoryGrid: React.FC<RoundCategoryGridProps> = ({ title, items, onCategoryClick }) => {
  return (
    <section className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 py-10">
      <h2 className="font-serif text-2xl text-gray-900 mb-6">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 md:gap-x-6 gap-y-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer flex flex-col items-center sm:items-start"
            onClick={() => onCategoryClick?.(item.title)}
          >
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100 relative shadow-sm transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-md">
              <SafeImage 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold text-gray-900 text-sm md:text-[15px] leading-tight group-hover:underline decoration-2 underline-offset-4 text-center sm:text-left">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};
