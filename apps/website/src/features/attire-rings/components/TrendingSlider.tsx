import React from 'react';
import { Product } from '../types';
import { HorizontalSlider } from './HorizontalSlider';
import { Heart } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface TrendingSliderProps {
  items: Product[];
  onProductClick?: (product: Product) => void;
  isProductSaved?: (product: Product) => boolean;
  onToggleSave?: (product: Product) => void;
}

export const TrendingSlider: React.FC<TrendingSliderProps> = ({
  items,
  onProductClick,
  isProductSaved,
  onToggleSave,
}) => {
  return (
    <section className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 py-6">
      <HorizontalSlider itemWidth={300}>
        {items.map((product) => (
          <div 
            key={product.id} 
            className="group relative min-w-[180px] sm:min-w-[200px] md:min-w-[260px] aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
            onClick={() => onProductClick?.(product)}
          >
            <SafeImage 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            {/* Hover Heart */}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleSave?.(product);
              }}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-100 hover:bg-gray-100 transition-opacity z-10"
              aria-label={isProductSaved?.(product) ? 'Remove from favorites' : 'Save to favorites'}
            >
               <Heart size={18} className={isProductSaved?.(product) ? 'text-red-500' : 'text-gray-900'} fill={isProductSaved?.(product) ? 'currentColor' : 'none'} />
            </button>
            
            {/* Price Pill */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md border border-gray-100 z-10">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-gray-900 text-xs sm:text-sm">TSh {product.price.toLocaleString()}</span>
                 {product.originalPrice && (
                    <span className="text-[10px] sm:text-xs text-gray-500 line-through decoration-gray-500">TSh {product.originalPrice.toLocaleString()}</span>
                 )}
               </div>
            </div>
          </div>
        ))}
      </HorizontalSlider>
    </section>
  );
};
