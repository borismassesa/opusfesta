import React from 'react';
import { Category } from '../types';
import { SafeImage } from './SafeImage';

interface SquareCategoryGridProps {
  title: string;
  items: Category[];
  onCategoryClick?: (category: string) => void;
}

export const SquareCategoryGrid: React.FC<SquareCategoryGridProps> = ({ title, items, onCategoryClick }) => {
  return (
    <section className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 py-12">
      <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-8 tracking-tight">{title}</h2>
      {/* Changed lg:grid-cols-6 to md:grid-cols-6 to maintain desktop layout on tablet */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
        {items.map((item) => (
          <div key={item.id} className="group cursor-pointer" onClick={() => onCategoryClick?.(item.title)}>
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 shadow-sm transition-shadow group-hover:shadow-md">
              <SafeImage 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:underline decoration-2 underline-offset-4 leading-tight">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};
