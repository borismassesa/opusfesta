import { Mic, Play } from 'lucide-react';

export default function WishFeed() {
  return (
    <section className="lg:col-span-7">
      {/* Filter Chips */}
      <div className="flex gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
        <button className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full bg-primary text-on-primary">All Wishes</button>
        <button className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full border border-outline-variant text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer">Family</button>
        <button className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full border border-outline-variant text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer">Friends</button>
        <button className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full border border-outline-variant text-secondary hover:border-primary hover:text-primary transition-colors cursor-pointer">Voice Notes</button>
      </div>

      <div className="space-y-16">
        {/* Pinned Editorial Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-8 md:p-12 rounded-2xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -z-0"></div>
          <div className="md:col-span-5 relative z-10">
            <div className="overflow-hidden rounded-xl bg-surface-container aspect-[4/5] shadow-sm">
              <img 
                alt="Couple" 
                className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH96o6oequicSGka3qyTxtNJhCflwzllBYMB8WIagRS5cDryYnl6B4P_ptVQpQRhM6Lifwn4TlpABfi1pQRaX37rOjDB1PbPXP_kLFHr9JUj1ZFfgqiCmZNy9nUeR0eJ3BJtD1ZfCv_ZglCmaMAWhn8VmBf0B-vpNg_-jZHa761xtnT7-BPJtJwcxiA3NPIk591BaaOmp0X4QEM1UaxqG8Svg7FXMF-2YcPf_oTm0YBQbW4GZkxf9OO043GfRk2ryKlQ"
              />
            </div>
          </div>
          <div className="md:col-span-7 space-y-6 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> Pinned
              </span>
            </div>
            <h3 className="font-display-md text-3xl md:text-4xl">The Happy Couple</h3>
            <p className="text-secondary italic text-lg leading-relaxed font-light font-display-md">
              "Our hearts are so full. Thank you for being part of our journey. We can't wait to read all your beautiful messages."
            </p>
            <div className="pt-6 border-t border-outline-variant/30">
              <p className="text-[10px] uppercase tracking-widest text-secondary/50 font-bold">Amina & Juma • Ubungo, Dar es Salaam</p>
            </div>
          </div>
        </div>

        {/* Grid for other wishes */}
        <div className="columns-1 md:columns-2 gap-8 space-y-8">
          
          {/* Voice Note Card */}
          <div className="break-inside-avoid group bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1">Zainab Ally</h4>
                <p className="text-[10px] text-secondary/60 uppercase tracking-tighter">Aunt • 2 hours ago</p>
              </div>
              <Mic className="w-5 h-5 text-accent/40 group-hover:text-accent transition-colors" />
            </div>
            <div className="bg-surface-container p-4 rounded-xl mb-6 flex items-center gap-4">
              <button className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-transform shrink-0 cursor-pointer shadow-md">
                <Play className="w-5 h-5 fill-current ml-1" />
              </button>
              <div className="flex-1 h-1.5 bg-outline-variant/30 relative overflow-hidden rounded-full">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-primary rounded-full"></div>
              </div>
              <span className="text-[10px] font-bold font-mono text-secondary tracking-tighter shrink-0">0:14</span>
            </div>
            <p className="text-secondary text-sm leading-relaxed font-light">"A beautiful wedding for a beautiful couple. Sending so much love!"</p>
          </div>

          {/* Text Wish Card */}
          <div className="break-inside-avoid bg-primary/5 p-8 rounded-2xl shadow-sm border border-primary/10 hover:shadow-md transition-shadow">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1 text-primary">Kelvin & Sarah</h4>
                <p className="text-[10px] text-primary/60 uppercase tracking-tighter">Friends • 5 hours ago</p>
              </div>
              <span className="text-5xl text-primary/20 font-serif leading-none mt-2">"</span>
            </div>
            <p className="text-primary/90 text-base leading-relaxed font-display-md italic relative z-10 -mt-2">
              May your marriage be filled with all the right ingredients: a heap of love, a dash of humor, and a touch of romance.
            </p>
          </div>
          
          {/* Photo Wish Card */}
          <div className="break-inside-avoid group bg-white p-3 rounded-2xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
            <div className="aspect-square rounded-xl overflow-hidden mb-5 bg-surface-container">
              <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80" alt="Wedding guest" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="px-5 pb-4">
              <div className="mb-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1">Mary & John</h4>
                <p className="text-[10px] text-secondary/60 uppercase tracking-tighter">Colleagues • 2 days ago</p>
              </div>
              <p className="text-secondary text-sm leading-relaxed font-light">"Cheers to the most beautiful couple. The ceremony was breathtaking!"</p>
            </div>
          </div>

          {/* Father's Message Card */}
          <div className="break-inside-avoid bg-surface-container p-8 rounded-2xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h4 className="text-[11px] font-bold uppercase tracking-widest mb-1">Baba Juma</h4>
              <p className="text-[10px] text-secondary/60 uppercase tracking-tighter">Father of Groom • 1 day ago</p>
            </div>
            <p className="text-secondary text-sm leading-relaxed font-light italic">
              "Welcome to the family, Amina. My son, you've chosen a wonderful partner. Be kind to each other."
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
