import React from 'react';
import { PlayCircle, Search } from 'lucide-react';

const MOCK_IMAGES = {
  couple: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
  ring: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=600&fit=crop",
  details: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop",
  party: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop",
  dress: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&h=600&fit=crop",
  venue: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",
  magazine: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&h=800&fit=crop",
  flowers: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&h=600&fit=crop",
  spreadsheet: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop",
};

const EDITOR_PICKS = [
  { title: "ChatGPT Prompts to Help You Find Your Wedding...", date: "Feb 10, 2026", author: "Esther Lee", image: MOCK_IMAGES.flowers, isVideo: true },
  { title: "2026 Gen Z Wedding Trends, Spotted by Our Gen Z Editor", date: "Oct 03, 2025", author: "Chapelle Johnson", image: MOCK_IMAGES.party },
  { title: "How to Find a Couple's Wedding Website & Registry", date: "Feb 05, 2026", author: "Emily Ramsey", image: MOCK_IMAGES.details },
  { title: "How Much Should You Spend on an Engagement Ring?", date: "Mar 23, 2026", author: "Kate Traverson", image: MOCK_IMAGES.ring, sponsored: true },
];

const POPULAR_TOPICS = [
  { title: "Planning Advice", image: MOCK_IMAGES.spreadsheet },
  { title: "Ceremony & Reception", image: MOCK_IMAGES.venue },
  { title: "Relationships", image: MOCK_IMAGES.couple },
  { title: "Married Life", image: MOCK_IMAGES.party },
  { title: "Engagement", image: MOCK_IMAGES.ring },
  { title: "Fashion", image: MOCK_IMAGES.dress },
  { title: "Gifts", image: MOCK_IMAGES.details },
  { title: "Beauty & Wellness", image: MOCK_IMAGES.flowers },
  { title: "Travel", image: MOCK_IMAGES.venue },
  { title: "Parties & Events", image: MOCK_IMAGES.party },
  { title: "Wedding Data & Insights", image: MOCK_IMAGES.details },
  { title: "News", image: MOCK_IMAGES.couple },
];

const LOVED_BY_COUPLES = [
  { title: "You Need to See These Lucky and Unlucky Wedding Dates", date: "Feb 11, 2026", author: "Hannah Nowack", image: MOCK_IMAGES.party },
  { title: "Free Wedding Items That'll Save You Tons of Money", date: "Mar 26, 2026", author: "Chapelle Johnson", image: MOCK_IMAGES.details },
  { title: "Everything You Need to Know About an Audio Guest Book", date: "Feb 09, 2026", author: "Chapelle Johnson", image: MOCK_IMAGES.venue },
  { title: "The Best Shapewear for Every Type of Wedding Dress", date: "Apr 14, 2026", author: "Sofia Deeb", image: MOCK_IMAGES.dress },
];

const LATEST_STORIES = [
  { title: "See the Newest Wedding Dress Styles from Top...", date: "Apr 20, 2026", image: MOCK_IMAGES.dress },
  { title: "\"Happy Mother's Day\" Quotes for Your Wife She'll...", date: "Apr 20, 2026", image: MOCK_IMAGES.couple },
  { title: "The Best \"Happy Mother's Day, Mother-in-Law\" Wishes", date: "Apr 20, 2026", image: MOCK_IMAGES.flowers },
  { title: "The 51 Best Mother's Day Gifts for Your Wife", date: "Apr 17, 2026", image: MOCK_IMAGES.details },
  { title: "The 55 Best Wedding Gift Ideas for Couples", date: "Apr 16, 2026", image: MOCK_IMAGES.details },
  { title: "Is a Suit or Tux Rental the Best Bang for Your Buck?", date: "Apr 15, 2026", isVideo: true, image: MOCK_IMAGES.party },
  { title: "We Found the Best Mother-of-the-Bride Beach Outfits", date: "Apr 15, 2026", image: MOCK_IMAGES.dress },
  { title: "What's the Best Website to Find Wedding Vendors?", date: "Apr 15, 2026", image: MOCK_IMAGES.spreadsheet },
  { title: "Preview Spring 2027 Justin Alexander Wedding Dresses", date: "Apr 14, 2026", image: MOCK_IMAGES.dress },
  { title: "See the Latest Pnina Tornai Wedding Dress Collection", date: "Apr 14, 2026", image: MOCK_IMAGES.dress },
  { title: "Benefits of Marriage: Tax, Legal, Financial and More", date: "Apr 13, 2026", image: MOCK_IMAGES.couple },
  { title: "The Biggest Wedding Dress Trends of 2027", date: "Apr 10, 2026", image: MOCK_IMAGES.dress },
];

// --- Shared Components ---

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-6 border-b border-slate-200 pb-2">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
    {subtitle && <p className="text-sm text-slate-600 max-w-3xl">{subtitle}</p>}
  </div>
);

const ArticleCard = ({ article }: { article: any }) => (
  <div className="group cursor-pointer flex flex-col h-full">
    <div className="relative aspect-[4/3] overflow-hidden rounded-md mb-4 bg-slate-100">
      <img 
        src={article.image} 
        alt={article.title} 
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      />
      {article.sponsored && (
        <span className="absolute top-2 left-2 bg-white/90 text-xs font-semibold px-2 py-1 rounded">SPONSORED</span>
      )}
      {article.isVideo && (
        <div className="absolute bottom-2 left-2 bg-black/50 rounded-full text-white p-1">
           <PlayCircle size={24} />
        </div>
      )}
    </div>
    <div className="flex flex-col flex-grow">
      <h3 className="font-bold text-[15px] leading-tight mb-2 group-hover:underline decoration-2 underline-offset-2">{article.title}</h3>
      <p className="text-[11px] text-slate-500 mt-auto">{article.date} {article.author ? `- ${article.author}` : ''}</p>
    </div>
  </div>
);

const TopicCard = ({ topic }: { topic: any }) => (
  <div className="flex items-center gap-3 pr-2 bg-white border border-slate-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer group shadow-sm">
    <div className="w-14 h-14 rounded-l-lg overflow-hidden shrink-0">
      <img src={topic.image} alt={topic.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <span className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors leading-tight">{topic.title}</span>
  </div>
);

// --- Layout Components ---

const SecondaryNav = () => (
  <div className="bg-black text-white px-4 py-3 flex items-center justify-between relative z-50">
    <div className="hidden lg:flex items-center gap-6 text-[15px] ml-4 font-normal">
      <a href="#" className="hover:text-pink-400 transition-colors">Engagement</a>
      <a href="#" className="hover:text-pink-400 transition-colors">Ceremony & Reception</a>
      <a href="#" className="hover:text-pink-400 transition-colors">Parties & Events</a>
      <a href="#" className="hover:text-pink-400 transition-colors">Travel</a>
      <a href="#" className="hover:text-pink-400 transition-colors">Fashion</a>
      <a href="#" className="hover:text-pink-400 transition-colors">Gifts</a>
      <a href="#" className="hover:text-pink-400 transition-colors">The Knot Magazine</a>
    </div>
    
    <div className="flex-1 lg:flex-none flex justify-center lg:justify-end max-w-sm lg:max-w-md w-full mx-auto lg:mx-0 lg:mr-4">
      <div className="flex items-center bg-white rounded-sm overflow-hidden w-full h-[40px]">
        <input 
          type="text" 
          placeholder="Search articles and inspiration" 
          className="px-4 py-2 text-[15px] text-slate-900 w-full outline-none placeholder:text-slate-500 font-sans"
        />
        <button className="bg-[#ff0090] text-white h-full px-5 hover:bg-[#e60082] transition-colors flex items-center justify-center shrink-0">
          <Search size={18} />
        </button>
      </div>
    </div>
  </div>
);

const Hero = () => (
  <section className="bg-[#fff0f3] py-20 relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
      <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">Ideas & Advice</h1>
      <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
        This is your one-stop shop for all things wedding-related. See the latest wedding ideas and advice, what couples are loving, The Knot editors' favorite stories and much more.
      </p>
    </div>
    {/* Decorative Elements - Approximation of the background blobs */}
    <div className="absolute top-10 left-1/4 w-8 h-8 rounded-full bg-pink-300 opacity-50 blur-sm"></div>
    <div className="absolute top-20 right-1/4 w-12 h-12 rounded-full bg-yellow-300 opacity-50 blur-sm"></div>
    <div className="absolute bottom-10 right-1/3 w-6 h-6 rounded-full inline-block bg-pink-400 opacity-60"></div>
  </section>
);

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-pink-200 selection:text-pink-900">
      <SecondaryNav />
      <main>
        <Hero />
        
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
          
          {/* Editor Picks */}
          <section>
            <SectionHeader 
              title="Our Editor Picks" 
              subtitle="Welcome to the inspiration stage of your wedding planning journey. Here, we're bringing you the latest advice and trendiest ideas to help you plan the best day ever."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {EDITOR_PICKS.map((item, i) => <ArticleCard key={i} article={item} />)}
            </div>
          </section>

          {/* Popular Topics */}
          <section>
            <SectionHeader title="Popular Topics" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {POPULAR_TOPICS.map((item, i) => <TopicCard key={i} topic={item} />)}
            </div>
          </section>

          {/* Loved by Couples */}
          <section>
             <SectionHeader 
              title="Loved by Couples" 
              subtitle="Check out the expert tips, tricks and wedding planning ideas that are trending lately."
            />
            <div className="mb-10 block lg:flex">
              <div className="relative w-full lg:w-3/5 aspect-video lg:aspect-auto bg-slate-100">
                <img src={MOCK_IMAGES.spreadsheet} alt="Spreadsheet" className="object-cover w-full h-full" />
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded text-xs font-bold tracking-wide">
                  the knot
                </div>
              </div>
              <div className="w-full lg:w-2/5 bg-black text-white p-8 md:p-12 flex flex-col justify-center">
                <span className="text-pink-500 font-bold text-xs tracking-widest uppercase mb-4">TRENDING</span>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight hover:underline cursor-pointer">You Need This Wedding Planning Spreadsheet Right Now</h3>
                <p className="text-slate-300 text-lg mb-6">We've got an option for both Excel and Google Sheets stans.</p>
                <div className="text-xs text-slate-400">Feb 11, 2026 - Cathryn Haight</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {LOVED_BY_COUPLES.map((item, i) => <ArticleCard key={i} article={item} />)}
            </div>
          </section>



          {/* The Knot Magazine */}
          <section className="bg-pink-50 rounded-2xl overflow-hidden flex flex-col lg:flex-row items-center justify-between">
            <div className="p-10 lg:p-16 lg:pr-8 w-full lg:w-1/2">
              <h3 className="text-2xl font-bold mb-2">The Knot Magazine</h3>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-none">Hot Off the Press! The Knot Magazine Stories You Can't Miss</h2>
              <p className="text-lg text-slate-700 leading-relaxed">Looking for fresh wedding inspo? Check out the latest issue of The Knot Magazine.</p>
            </div>
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center lg:justify-end p-10 lg:p-0">
               <img src={MOCK_IMAGES.magazine} alt="Magazine Cover" className="max-w-xs md:max-w-md lg:max-w-lg object-contain drop-shadow-2xl -rotate-2" />
            </div>
          </section>

          {/* Our Favorites */}
          <section className="bg-orange-50/50 p-8 lg:p-12 rounded-2xl -mx-4 lg:mx-0">
             <SectionHeader 
              title="Our Favorites" 
              subtitle="The Knot editorial team is full of wedding industry experts, from fashion editors to honeymoon travel writers to wedding etiquette gurus. Here, they share their favorite stories of the moment."
            />
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Featured Favorite */}
              <div className="w-full lg:w-1/2 group cursor-pointer">
                 <div className="relative w-full aspect-[4/3] bg-orange-200 rounded-xl overflow-hidden mb-6">
                    <img src={MOCK_IMAGES.party} alt="Vendors" className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    {/* Add some chaotic colorful overlay blocks to match screenshot style */}
                    <div className="absolute top-1/4 left-10 w-1/3 aspect-square bg-orange-500 rotate-12 mix-blend-overlay"></div>
                    <div className="absolute bottom-10 right-10 w-1/2 aspect-[4/3] bg-purple-500 -rotate-6 mix-blend-overlay"></div>
                 </div>
                 <h3 className="text-3xl font-bold mb-3 group-hover:underline underline-offset-4 leading-tight">Your Ultimate Guide to Unique Wedding Vendors</h3>
                 <p className="text-sm text-slate-500">Nov 25, 2025 - Cathryn Haight</p>
              </div>

              {/* Stacked Favorites */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between gap-6">
                {[
                  { title: "Short Wedding Dresses for Every Style and Budget", date: "Feb 10, 2026 - Sofia Deeb", image: MOCK_IMAGES.dress },
                  { title: "How Much to Tip Wedding Vendors: The Ultimate Guide", date: "Jan 28, 2026 - Chapelle Johnson", image: MOCK_IMAGES.flowers },
                  { title: "A Deep Dive Into Bad Bunny's Halftime Show Wedding", date: "Feb 10, 2026 - Sarah Hanlon", image: MOCK_IMAGES.party }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group cursor-pointer items-center">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 shrink-0 rounded-lg overflow-hidden relative bg-slate-100">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {i === 1 && <div className="absolute inset-0 bg-yellow-400/20 mix-blend-multiply"></div>}
                      {i === 2 && <div className="absolute bottom-2 left-2 bg-black/50 rounded-full text-white p-1"><PlayCircle size={20} /></div>}
                    </div>
                    <div>
                      <h4 className="text-xl lg:text-2xl font-bold mb-2 group-hover:underline leading-tight">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest Stories */}
          <section>
             <SectionHeader title="Latest Stories" />
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
               {LATEST_STORIES.slice(0, 3).map((item, i) => <ArticleCard key={i} article={item} />)}
               
               {/* Inject an Ad block occasionally to match screenshot */}
               <div className="hidden lg:flex flex-col h-full bg-slate-50 border border-slate-200">
                  <div className="text-center py-2 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-200">Advertisement</div>
                  <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden bg-slate-100">
                     <img src={MOCK_IMAGES.ring} alt="Ad background" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply grayscale" />
                     <div className="relative text-center z-10">
                        <div className="font-serif text-3xl font-bold tracking-widest text-black mb-4 bg-white/80 px-4 py-2 inline-block">PANDORA</div>
                        <button className="bg-black text-white px-6 py-2 text-xs font-bold uppercase block mx-auto">Shop Now</button>
                     </div>
                  </div>
               </div>

               {LATEST_STORIES.slice(3, 11).map((item, i) => <ArticleCard key={`b-${i}`} article={item} />)}

               {/* Another Ad */}
                <div className="hidden lg:flex flex-col h-full bg-slate-50 border border-slate-200">
                  <div className="text-center py-2 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-200">Advertisement</div>
                  <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden bg-pink-100">
                     <img src={MOCK_IMAGES.details} alt="Ad background" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply blur-[2px]" />
                     <div className="relative text-center z-10">
                        <div className="font-serif text-3xl font-bold tracking-widest text-black mb-4 bg-white/80 px-4 py-2 inline-block">PANDORA</div>
                        <button className="bg-black text-white px-6 py-2 text-xs font-bold uppercase block mx-auto">Shop Now</button>
                     </div>
                  </div>
               </div>

               {LATEST_STORIES.slice(11).map((item, i) => <ArticleCard key={`c-${i}`} article={item} />)}

             </div>
          </section>

        </div>
      </main>
    </div>
  );
}
