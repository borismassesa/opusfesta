import React, { useState, useEffect } from 'react';
import { Category, Product } from '../types';
import { ProductCard } from './ProductCard';
import { ListFilter, ChevronDown, CircleHelp, X, ChevronRight, Star, Check } from 'lucide-react';
import { SafeImage } from './SafeImage';

interface CategoryPageProps {
  categoryTitle: string;
  subtitle: string;
  subCategories: Category[];
  products: Product[];
  onProductClick?: (product: Product) => void;
  isProductSaved?: (product: Product) => boolean;
  onToggleSave?: (product: Product) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ 
  categoryTitle, 
  subtitle, 
  subCategories, 
  products,
  onProductClick,
  isProductSaved,
  onToggleSave,
}) => {
  const [showAllSubCats, setShowAllSubCats] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const activeCategoryLabel = categoryTitle?.trim() || 'Category';
  const activeCategoryLabelLower = activeCategoryLabel.toLowerCase();
  const itemFormatOptions = [
    `All ${activeCategoryLabel}`,
    `Physical ${activeCategoryLabelLower} items`,
    `Digital ${activeCategoryLabelLower} downloads`,
  ];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

  // Sub-categories grid: Show 6 items initially to match the screenshot layout
  const visibleSubCats = showAllSubCats ? subCategories : subCategories.slice(0, 6);

  return (
    <div className="bg-white min-h-screen pb-16">
      <div className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center py-8 sm:py-10">
           <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">{categoryTitle}</h1>
           <p className="text-gray-500 text-sm md:text-base max-w-2xl leading-relaxed">{subtitle}</p>
        </div>

        {/* Sub-Category Cards */}
        {/* Added max-w-5xl mx-auto to reduce card size, adjusted text to text-sm */}
        {/* Updated grid to 6 columns on tablet (md) screens to match request for small cards on tablet */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10 max-w-5xl mx-auto">
           {visibleSubCats.map((cat, index) => (
             <div key={`${cat.id}-${cat.title}-${index}`} className="group cursor-pointer flex flex-col items-center">
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-100 relative transition-transform duration-300 group-hover:scale-[1.02] shadow-sm">
                   <SafeImage src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm text-center group-hover:underline decoration-2 underline-offset-4">{cat.title}</h3>
             </div>
           ))}
        </div>
        
        {subCategories.length > 6 && (
          <div className="flex justify-center mb-12">
             <button 
               onClick={() => setShowAllSubCats(!showAllSubCats)}
               className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-2.5 px-6 rounded-full text-sm transition-colors"
             >
               {showAllSubCats ? "Show less" : `Show more (${subCategories.length - 6})`}
             </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sticky top-[68px] z-30 bg-white py-3">
           <button 
             onClick={() => setIsFilterOpen(true)}
             className="flex items-center gap-2 border border-gray-400 rounded-full px-4 py-2 hover:bg-gray-50 hover:shadow-sm text-sm font-medium text-gray-900 w-full sm:w-auto justify-center transition-all"
           >
              <ListFilter size={18} />
              All Filters
           </button>
           
           <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-end">
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 transition-colors">
                1,000+ {activeCategoryLabelLower} items with ads
                <CircleHelp size={16} className="text-gray-400" />
              </span>
              <button className="flex items-center gap-1 font-medium text-gray-900 border border-gray-400 rounded-full px-4 py-2 hover:bg-gray-50 hover:shadow-sm transition-all whitespace-nowrap">
                 Sort by: <span className="font-bold">Relevance</span>
                 <ChevronDown size={16} />
              </button>
           </div>
        </div>

        {/* Main Content: Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10">
            {products.map((product, index) => (
              <div key={`${product.id}-${product.title}-${index}`} onClick={() => onProductClick?.(product)}>
                <ProductCard
                  product={product}
                  isSaved={isProductSaved?.(product) ?? false}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
        </div>

      </div>

      {/* Filter Sidebar Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity" 
             onClick={() => setIsFilterOpen(false)}
           />

           {/* Sidebar / Modal Panel */}
           <div className="relative w-full sm:w-[450px] bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
              
              {/* Header */}
              <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                 <h2 className="font-serif text-3xl text-gray-900">Filters</h2>
                 <button 
                   onClick={() => setIsFilterOpen(false)}
                   className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                 >
                   <X size={24} />
                 </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                 
                 {/* Filter by category */}
                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Filter by category</label>
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-full hover:shadow-sm hover:border-gray-400 transition-all text-left">
                       <span className="font-medium text-gray-900">{activeCategoryLabel}</span>
                       <ChevronRight size={20} className="text-gray-500" />
                    </button>
                 </div>

                 <hr className="border-gray-100" />

                 {/* Special offers */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-4">Special offers</h3>
                    <div className="space-y-4">
                       <label className="flex items-center gap-3 cursor-pointer group select-none">
                          <div className="relative flex items-center">
                            <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-black checked:border-black transition-colors" />
                            <Check size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <span className="text-gray-700 text-[15px] group-hover:text-black">FREE delivery</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group select-none">
                           <div className="relative flex items-center">
                            <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-black checked:border-black transition-colors" />
                            <Check size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <span className="text-gray-700 text-[15px] group-hover:text-black">On sale</span>
                       </label>
                    </div>
                 </div>

                 <hr className="border-gray-100" />

                 {/* Shop Location */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-4">Shop Location</h3>
                    <div className="space-y-4">
                        {['Anywhere', 'Tanzania', 'Custom'].map((opt, i) => (
                            <label key={opt} className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className="relative flex items-center">
                                    <input type="radio" name="modal_loc" defaultChecked={i===0} className="peer appearance-none w-6 h-6 rounded-full border-2 border-gray-300 checked:border-black transition-colors" />
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-gray-700 text-[15px] group-hover:text-black">{opt}</span>
                            </label>
                        ))}
                        <div className="pl-9">
                            <input type="text" placeholder="Enter location" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow shadow-sm" />
                        </div>
                    </div>
                 </div>

                 <hr className="border-gray-100" />

                 {/* Item format */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-4">{activeCategoryLabel} format</h3>
                    <div className="space-y-4">
                        {itemFormatOptions.map((opt, i) => (
                            <label key={opt} className="flex items-center gap-3 cursor-pointer group select-none">
                                 <div className="relative flex items-center">
                                    <input type="radio" name="modal_fmt" defaultChecked={i===0} className="peer appearance-none w-6 h-6 rounded-full border-2 border-gray-300 checked:border-black transition-colors" />
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-gray-700 text-[15px] group-hover:text-black">{opt}</span>
                            </label>
                        ))}
                    </div>
                 </div>

                 <hr className="border-gray-100" />

                 {/* OpusFesta's best */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-4">{activeCategoryLabel} picks</h3>
                    <div className="space-y-4">
                       <label className="flex items-center gap-3 cursor-pointer group select-none">
                           <div className="relative flex items-center">
                            <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-black checked:border-black transition-colors" />
                            <Check size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <span className="text-gray-700 text-[15px] group-hover:text-black">Featured {activeCategoryLabel} pick</span>
                       </label>
                       <label className="flex items-start gap-3 cursor-pointer group select-none">
                           <div className="relative flex items-center mt-0.5">
                            <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-black checked:border-black transition-colors" />
                            <Check size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <div className="flex flex-col">
                             <div className="flex items-center gap-1.5">
                                <span className="text-gray-700 text-[15px] group-hover:text-black font-medium">Star Seller</span>
                                <div className="bg-[#651a93] rounded-full p-0.5">
                                    <Star size={10} fill="white" className="text-white" />
                                </div>
                             </div>
                             <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-[280px]">
                                Consistently earned 5-star reviews, dispatched orders on time, and replied quickly to messages
                             </p>
                          </div>
                       </label>
                    </div>
                 </div>

                 <hr className="border-gray-100" />
                 
                 {/* Ready to dispatch in */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-4">Ready to dispatch in</h3>
                    <div className="space-y-4">
                       <label className="flex items-center gap-3 cursor-pointer group select-none">
                           <div className="relative flex items-center">
                            <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-black checked:border-black transition-colors" />
                            <Check size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <span className="text-gray-700 text-[15px] group-hover:text-black">1 day</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group select-none">
                           <div className="relative flex items-center">
                            <input type="checkbox" className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded-md checked:bg-black checked:border-black transition-colors" />
                            <Check size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <span className="text-gray-700 text-[15px] group-hover:text-black">1–3 days</span>
                       </label>
                    </div>
                 </div>

                 <hr className="border-gray-100" />

                 {/* Price */}
                 <div>
                    <h3 className="font-bold text-gray-900 mb-4">Price (TSh)</h3>
                    <div className="space-y-4">
                        {['Any price', 'Under TSh 25,000', 'TSh 25,000 to TSh 100,000', 'Over TSh 100,000'].map((opt, i) => (
                            <label key={opt} className="flex items-center gap-3 cursor-pointer group select-none">
                                 <div className="relative flex items-center">
                                    <input type="radio" name="modal_price" defaultChecked={i===0} className="peer appearance-none w-6 h-6 rounded-full border-2 border-gray-300 checked:border-black transition-colors" />
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-gray-700 text-[15px] group-hover:text-black">{opt}</span>
                            </label>
                        ))}
                        <div className="flex items-center gap-3 pl-9 pt-1">
                            <div className="relative flex-1">
                               <input type="text" placeholder="Low" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-black" />
                            </div>
                            <span className="text-gray-500 text-sm">to</span>
                            <div className="relative flex-1">
                               <input type="text" placeholder="High" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-black" />
                            </div>
                            <button className="w-9 h-9 flex-shrink-0 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 transition-colors">
                               <ChevronRight size={18} className="text-gray-600" />
                            </button>
                         </div>
                    </div>
                 </div>

              </div>

              {/* Footer Actions */}
              <div className="p-4 px-6 border-t border-gray-200 flex items-center justify-between gap-4 bg-white shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                  <button 
                    onClick={() => setIsFilterOpen(false)} 
                    className="flex-1 py-3 px-6 rounded-full border-2 border-black font-bold text-gray-900 hover:bg-gray-50 transition-all text-[15px]"
                  >
                     Cancel
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)} 
                    className="flex-1 py-3 px-6 rounded-full bg-black text-white font-bold hover:bg-gray-800 transition-all shadow-lg text-[15px]"
                  >
                     Apply
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
