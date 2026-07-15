import { useState } from 'react';
import { Gift, CheckCircle } from 'lucide-react';

interface RegistryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  claimed: boolean;
}

export default function Registry() {
  const [items, setItems] = useState<RegistryItem[]>([
    {
      id: '1',
      title: 'Espresso Machine',
      description: 'For our early morning starts and weekend coffees.',
      image: 'https://images.unsplash.com/photo-1510227272981-87123e259b17?auto=format&fit=crop&w=800&q=80',
      price: '$250',
      claimed: false,
    },
    {
      id: '2',
      title: 'Stand Mixer',
      description: 'To help us bake sweet memories together.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      price: '$300',
      claimed: false,
    },
    {
      id: '3',
      title: 'Honeymoon Fund',
      description: 'Contribute to our dream trip to Zanzibar.',
      image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
      price: 'Any amount',
      claimed: false,
    },
    {
      id: '4',
      title: 'Luxury Bedding Set',
      description: 'High thread count sheets for a good night\'s rest.',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      price: '$150',
      claimed: false,
    },
    {
      id: '5',
      title: 'Cast Iron Cookware',
      description: 'For hearty family meals that last generations.',
      image: 'https://images.unsplash.com/photo-1584285465355-0814f8a37f5f?auto=format&fit=crop&w=800&q=80',
      price: '$120',
      claimed: false,
    },
    {
      id: '6',
      title: 'Smart Home Speaker',
      description: 'To fill our home with our favorite playlists.',
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
      price: '$99',
      claimed: false,
    },
  ]);

  const handleClaim = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, claimed: true } : item
      )
    );
  };

  const remainingCount = items.filter((item) => !item.claimed).length;

  return (
    <div className="max-w-container-max mx-auto px-margin-page">
      <div className="mb-20 text-center max-w-2xl mx-auto">
        <h2 className="font-display-md text-4xl lg:text-5xl mb-6">Registry</h2>
        <p className="text-secondary text-sm lg:text-base leading-relaxed font-light italic font-display-md mb-8">
          Your presence is present enough, but if you wish to give a gift, here are some things we'd love for our new chapter.
        </p>
        <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary/5 border border-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-widest">
          <Gift className="w-4 h-4" />
          <span>{remainingCount} Gifts Remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {items.map((item) => (
          <div key={item.id} className={`group flex flex-col ${item.claimed ? 'opacity-70' : ''}`}>
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-container rounded-2xl mb-6">
              <img 
                src={item.image} 
                alt={item.title} 
                className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  item.claimed ? 'grayscale' : 'grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105'
                }`}
              />
              {item.claimed && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white/90 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Reserved
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3 gap-4">
                <h3 className="font-display-md text-2xl pr-2">{item.title}</h3>
                <span className="text-[11px] font-bold uppercase tracking-widest text-secondary mt-2 shrink-0">
                  {item.price}
                </span>
              </div>
              <p className="text-secondary text-sm font-light leading-relaxed mb-8 flex-1">
                {item.description}
              </p>
              
              <button 
                onClick={() => !item.claimed && handleClaim(item.id)}
                disabled={item.claimed}
                className={`w-full py-4 transition-all text-[10px] font-bold uppercase tracking-widest rounded-sm ${
                  item.claimed 
                    ? 'bg-surface-container text-secondary/50 cursor-not-allowed' 
                    : 'border border-outline-variant text-secondary hover:border-primary hover:text-primary cursor-pointer'
                }`}
              >
                {item.claimed ? 'Thank You' : 'Gift This'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
