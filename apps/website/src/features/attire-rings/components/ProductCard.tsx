import React from 'react';
import { Heart, Star, Play } from 'lucide-react';
import { Product } from '../types';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
  showVideoIcon?: boolean;
  variant?: 'default' | 'deal';
  isSaved?: boolean;
  onToggleSave?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showVideoIcon,
  variant = 'default',
  isSaved = false,
  onToggleSave,
}) => {
  return (
    <div className="group cursor-pointer flex flex-col h-full w-full">
      {/* Image Container - Aspect 4/3 for landscape look */}
      <div className="relative w-full aspect-[4/3] rounded-[4px] sm:rounded-md overflow-hidden mb-2 bg-gray-100 border border-transparent hover:shadow-md transition-all">
        <SafeImage 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transition-opacity hover:opacity-90"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave?.(product);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm z-10"
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-red-500' : ''} />
        </button>
        {showVideoIcon && product.isVideo && (
             <div className="absolute bottom-2 left-2 bg-black/60 p-1.5 rounded-full text-white">
                 <Play size={12} fill="currentColor" />
             </div>
        )}
      </div>
      
      {/* Content Container */}
      <div className="flex flex-col flex-1">
        
        {/* 1. Title */}
        <h3 className="text-gray-900 text-sm font-normal truncate leading-snug mb-1" title={product.title}>
          {product.title}
        </h3>

        {/* 2. Rating & Star Seller Row */}
        {variant !== 'deal' && (product.rating || product.isStarSeller) && (
          <div className="flex items-center flex-wrap gap-1 mb-1">
             {product.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" className={i < Math.floor(product.rating || 0) ? "text-black" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.ratingCount?.toLocaleString()})</span>
                </div>
             )}
             
             {product.isStarSeller && (
               <div className="flex items-center gap-0.5 ml-1">
                 {/* Solid purple star for badge */}
                 <div className="relative flex items-center justify-center">
                    <Star size={12} fill="#651a93" className="text-[#651a93]" />
                 </div>
                 <span className="text-xs text-[#651a93] font-normal">Star Seller</span>
               </div>
             )}
          </div>
        )}

        {/* 3. Price Row */}
        <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
            <span className={`font-bold ${variant === 'deal' ? 'text-green-700 text-lg' : 'text-gray-900 text-base'}`}>
               TSh {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <>
                 <span className="text-xs text-gray-500 line-through">TSh {product.originalPrice.toLocaleString()}</span>
                 {product.discountBadge && (
                    <span className={`text-xs ${variant === 'deal' ? 'bg-[#C3E8C8] text-black px-2 py-0.5 rounded-full' : 'text-[#258635]'} font-normal`}>
                       ({product.discountBadge})
                    </span>
                 )}
              </>
            )}
        </div>
          
        {/* 4. Seller / Ad Text */}
        <div className="mb-1.5">
          {variant !== 'deal' && product.isAd ? (
             <div className="text-xs text-gray-500">
               Ad by {product.seller?.name || "Etsy seller"}
             </div>
          ) : (variant !== 'deal' && product.seller?.name) ? (
             <div className="text-xs text-gray-500">
               {product.seller.name}
             </div>
          ) : null}
        </div>
        
        {/* 5. Free Delivery Badge */}
        {variant !== 'deal' && product.freeDelivery && (
          <div className="mt-auto">
             <span className="bg-[#d4e9d7] text-[#1f4825] text-[11px] font-bold px-2 py-0.5 rounded-full inline-block">
               FREE delivery
             </span>
          </div>
        )}

        {/* Deal Variant Extra Text */}
        {variant === 'deal' && product.dealText && (
           <div className="mt-1 text-xs font-bold text-gray-800">
              {product.dealText}
           </div>
        )}
      </div>
    </div>
  );
};
