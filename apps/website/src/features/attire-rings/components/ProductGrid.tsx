import React, { useRef } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { HorizontalSlider, HorizontalSliderHandle } from './HorizontalSlider';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  bgColor?: string;
  timer?: string;
  onProductClick?: (product: Product) => void;
  layout?: 'grid' | 'slider';
  cardVariant?: 'default' | 'deal';
  isProductSaved?: (product: Product) => boolean;
  onToggleSave?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  title, 
  subtitle, 
  products, 
  bgColor, 
  timer,
  onProductClick,
  layout = 'grid',
  cardVariant = 'default',
  isProductSaved,
  onToggleSave,
}) => {
  const sliderRef = useRef<HorizontalSliderHandle>(null);

  return (
    <section className={`py-12 ${bgColor ? bgColor : 'bg-white'}`}>
      <div className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24">
        <div className="flex flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-gray-900">{title}</h2>
            {timer && (
              <div className="flex items-center text-gray-600 gap-2 text-xs sm:text-sm sm:text-base font-light">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                <span>{timer}</span>
              </div>
            )}
          </div>
          
          {/* Header Actions */}
          {layout === 'slider' && (
             <div className="flex gap-3 hidden sm:flex">
               <button 
                  onClick={() => sliderRef.current?.scroll('left')}
                  className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
               >
                  <ChevronLeft size={22} className="text-gray-700" />
               </button>
               <button 
                  onClick={() => sliderRef.current?.scroll('right')}
                  className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
               >
                  <ChevronRight size={22} className="text-gray-700" />
               </button>
            </div>
          )}
        </div>

        {layout === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 sm:gap-6">
            {products.map((product, index) => (
              <div key={`${product.id}-${index}`} onClick={() => onProductClick?.(product)}>
                <ProductCard
                  product={product}
                  variant={cardVariant}
                  isSaved={isProductSaved?.(product) ?? false}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
          </div>
        ) : (
          <HorizontalSlider ref={sliderRef} itemWidth={260} showButtons={false}>
            {products.map((product, index) => (
              <div key={`${product.id}-${index}`} className="min-w-[160px] sm:min-w-[200px] md:min-w-[260px]" onClick={() => onProductClick?.(product)}>
                <ProductCard
                  product={product}
                  variant={cardVariant}
                  isSaved={isProductSaved?.(product) ?? false}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
          </HorizontalSlider>
        )}
      </div>
    </section>
  );
};
