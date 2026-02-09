import React from 'react';
import { Heart } from 'lucide-react';
import { SafeImage } from './SafeImage';

export const LocalShops: React.FC = () => {
  return (
    <section className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 py-16">
       {/* Changed lg:flex-row to md:flex-row to maintain desktop layout on tablet */}
       <div className="flex flex-col md:flex-row gap-10">
          {/* Text Side */}
          <div className="md:w-1/4 flex flex-col justify-center">
             <span className="text-sm text-gray-600 mb-2">Local talent? OpusFesta has it.</span>
             <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-8 leading-tight">
               Discover shops in Tanzania
             </h2>
             <div>
                <button className="bg-white border-2 border-black text-black font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-colors w-full sm:w-auto">
                    Shop from local makers
                </button>
             </div>
          </div>

          {/* Images Side */}
          <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-3 gap-6">
             {[
                {id: 1, img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400"},
                {id: 2, img: "https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=400"},
                {id: 3, img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80&w=400"},
             ].map((item) => (
                <div key={item.id} className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer">
                    <SafeImage src={item.img} alt="Local shop item" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart size={18} className="text-gray-800" />
                    </button>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
};
