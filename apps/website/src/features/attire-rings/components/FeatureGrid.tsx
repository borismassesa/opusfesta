import React from 'react';
import { Collection } from '../types';
import { SafeImage } from './SafeImage';

interface FeatureGridProps {
  title: string;
  subtitle: string;
  buttonText: string;
  items: Collection[];
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ title, subtitle, buttonText, items }) => {
  return (
    <section className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 pt-12 pb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Text Column */}
        <div className="md:w-1/4 flex flex-col justify-center items-start md:pr-8 mb-6 md:mb-0">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-2 leading-tight tracking-tight">
            {title} <br/> {subtitle}
          </h2>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-6 rounded-full transition-colors mt-6 text-sm">
            {buttonText}
          </button>
        </div>

        {/* Cards Grid */}
        <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group cursor-pointer relative rounded-xl overflow-hidden aspect-[4/3] md:aspect-auto md:h-80 shadow-sm hover:shadow-md transition-all">
               <SafeImage 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white pr-4">
                   <span className="font-bold text-lg md:text-xl leading-tight">{item.title}</span>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
