import { Heart, Calendar, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
          <iframe 
            src="https://www.youtube.com/embed/6FqJKRW8Qh4?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=6FqJKRW8Qh4&modestbranding=1&playsinline=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vw] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
            style={{ border: 0 }}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20"
        >
          <p className="text-white/90 text-sm md:text-base tracking-[0.3em] uppercase mb-6 font-light">
            We invite you to celebrate
          </p>
          <h1 className="font-display-md text-6xl md:text-8xl lg:text-9xl text-white mb-8 drop-shadow-md">
            Amina & Juma
          </h1>
          <div className="flex items-center gap-4 text-white/90">
            <div className="h-px w-12 bg-white/60"></div>
            <p className="font-display-md text-2xl md:text-3xl italic drop-shadow-sm">
              December 15, 2026
            </p>
            <div className="h-px w-12 bg-white/60"></div>
          </div>
        </motion.div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 md:py-32 px-4 md:px-margin-page bg-white relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Heart className="w-8 h-8 text-primary/60 mx-auto mb-10" strokeWidth={1} />
            <h2 className="font-display-md text-4xl md:text-5xl lg:text-6xl text-on-surface mb-8">
              Join Us for Our <br className="md:hidden" /> Special Day
            </h2>
            <p className="text-secondary text-base md:text-lg leading-loose font-light max-w-2xl mx-auto">
              We are so incredibly excited to celebrate our love story with our closest family and friends. 
              Your presence means the world to us, and we can't wait to share these unforgettable moments 
              as we begin this beautiful new chapter of our lives together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-20 bg-surface-container/30 px-4 md:px-margin-page border-y border-outline-variant/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center text-center p-10 bg-white rounded-3xl shadow-sm border border-outline-variant/30"
            >
              <Calendar className="w-8 h-8 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-display-md text-3xl mb-4 text-on-surface">The When</h3>
              <div className="w-12 h-px bg-primary/20 mb-8"></div>
              <p className="text-secondary font-light text-lg leading-relaxed">
                Saturday, December 15, 2026<br />
                Ceremony begins at 3:00 PM<br />
                Reception to follow
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex flex-col items-center text-center p-10 bg-white rounded-3xl shadow-sm border border-outline-variant/30"
            >
              <MapPin className="w-8 h-8 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-display-md text-3xl mb-4 text-on-surface">The Where</h3>
              <div className="w-12 h-px bg-primary/20 mb-8"></div>
              <p className="text-secondary font-light text-lg leading-relaxed">
                The Grand Botanical Gardens<br />
                123 Floral Avenue<br />
                Paradise City, PC 12345
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-col items-center text-center p-10 bg-white rounded-3xl shadow-sm border border-outline-variant/30"
            >
              <Sparkles className="w-8 h-8 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-display-md text-3xl mb-4 text-on-surface">Dress Code</h3>
              <div className="w-12 h-px bg-primary/20 mb-8"></div>
              
              <div className="flex justify-center gap-4 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1e293b] shadow-inner border border-black/10"></div>
                  <span className="text-[10px] uppercase tracking-wider text-secondary/60">Navy</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#94a3b8] shadow-inner border border-black/10"></div>
                  <span className="text-[10px] uppercase tracking-wider text-secondary/60">Slate</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#fde047] shadow-inner border border-black/10"></div>
                  <span className="text-[10px] uppercase tracking-wider text-secondary/60">Gold</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#fdfbf9] shadow-inner border border-black/10"></div>
                  <span className="text-[10px] uppercase tracking-wider text-secondary/60">Ivory</span>
                </div>
              </div>

              <p className="text-secondary font-light text-lg leading-relaxed">
                Formal / Black-Tie Optional<br />
                We'd love to see our family and friends get dressed up for our big day!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Photo Gallery - Clean Grid */}
      <section className="py-24 px-4 md:px-margin-page max-w-container-max mx-auto bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h2 className="font-display-md text-4xl md:text-5xl text-on-surface mb-6">Captured Moments</h2>
          <div className="w-16 h-px bg-primary/30 mx-auto"></div>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="col-span-2 md:col-span-2 row-span-2">
             <img 
               src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80" 
               alt="Couple walking on beach" 
               className="w-full h-full object-cover rounded-2xl aspect-[4/3] md:aspect-[16/9] hover:opacity-95 transition-opacity"
             />
          </div>
          <div className="col-span-1 md:col-span-1">
            <img 
               src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80" 
               alt="Rings" 
               className="w-full h-full object-cover rounded-2xl aspect-square hover:opacity-95 transition-opacity"
             />
          </div>
          <div className="col-span-1 md:col-span-1">
             <img 
               src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80" 
               alt="Wedding Details" 
               className="w-full h-full object-cover rounded-2xl aspect-square hover:opacity-95 transition-opacity"
             />
          </div>
        </div>
      </section>
    </div>
  );
}

