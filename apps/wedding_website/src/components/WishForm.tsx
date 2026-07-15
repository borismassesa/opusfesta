import { Mic, Camera } from 'lucide-react';

export default function WishForm() {
  return (
    <aside className="lg:col-span-5 lg:sticky lg:top-32">
      <div className="stationery-card rounded-3xl p-10 md:p-14 lg:p-16 shadow-xl shadow-primary/5 border border-primary/10">
        <h2 className="font-display-md text-4xl lg:text-5xl mb-6 lg:mb-8">Leave your wishes</h2>
        <p className="text-secondary text-sm lg:text-base leading-relaxed mb-10 lg:mb-12 font-light bg-white/80 inline-block px-2">
          Share a memory, advice, or a message for our new beginning.
        </p>
        <form className="space-y-8 lg:space-y-10" onSubmit={(e) => e.preventDefault()}>
          <div className="bg-white/60 p-2 -mx-2 rounded-lg">
            <label className="block text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] mb-3 lg:mb-4 text-secondary/70">Your Name</label>
            <input 
              className="w-full border-b border-outline-variant focus:border-primary border-t-0 border-x-0 bg-transparent px-0 py-2 lg:py-3 text-on-surface focus:ring-0 focus:outline-none placeholder:text-outline-variant/50 text-sm lg:text-base transition-colors" 
              placeholder="Enter your name" 
              type="text"
            />
          </div>
          <div className="bg-white/60 p-2 -mx-2 rounded-lg">
            <label className="block text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] mb-3 lg:mb-4 text-secondary/70">Relation</label>
            <select className="w-full border-b border-outline-variant focus:border-primary border-t-0 border-x-0 bg-transparent px-0 py-2 lg:py-3 text-on-surface focus:ring-0 focus:outline-none text-sm lg:text-base appearance-none cursor-pointer transition-colors">
              <option>Family</option>
              <option>Friend</option>
              <option>Colleague</option>
            </select>
          </div>
          <div className="bg-white/60 p-2 -mx-2 rounded-lg">
            <label className="block text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] mb-3 lg:mb-4 text-secondary/70">Message</label>
            <textarea 
              className="w-full border-b border-outline-variant focus:border-primary border-t-0 border-x-0 bg-transparent px-0 py-2 lg:py-3 text-on-surface focus:ring-0 focus:outline-none placeholder:text-outline-variant/50 text-sm lg:text-base leading-relaxed resize-y transition-colors" 
              placeholder="Write from the heart..." 
              rows={5}
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:gap-6 pt-4 lg:pt-6">
            <button className="flex items-center justify-center gap-2 lg:gap-3 py-4 lg:py-5 border border-outline-variant text-secondary hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-[10px] lg:text-xs font-bold uppercase tracking-widest cursor-pointer rounded-full bg-white/80 backdrop-blur-sm" type="button">
              <Mic className="w-4 h-4 lg:w-5 lg:h-5" /> Record
            </button>
            <button className="flex items-center justify-center gap-2 lg:gap-3 py-4 lg:py-5 border border-outline-variant text-secondary hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-[10px] lg:text-xs font-bold uppercase tracking-widest cursor-pointer rounded-full bg-white/80 backdrop-blur-sm" type="button">
              <Camera className="w-4 h-4 lg:w-5 lg:h-5" /> Photo
            </button>
          </div>
          <button className="w-full py-5 lg:py-6 bg-primary text-on-primary text-[11px] lg:text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all mt-4 lg:mt-6 shadow-xl shadow-primary/20 cursor-pointer rounded-full" type="submit">
            Send Your Love
          </button>
        </form>
      </div>
    </aside>
  );
}
