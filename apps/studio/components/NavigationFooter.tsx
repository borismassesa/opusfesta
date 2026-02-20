'use client';

export default function NavigationFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="border-t-4 border-brand-border bg-brand-bg px-6 lg:px-12 relative z-10">
      <div className="flex items-center justify-between h-20 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
        <button onClick={scrollToTop} className="w-12 h-12 hover:bg-brand-panel flex items-center justify-center transition-colors border-r-2 border-brand-border text-brand-dark">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19l-7-7l7-7m7 7H5"></path>
          </svg>
        </button>
        <div className="flex-1 flex justify-center gap-4 sm:gap-8 md:gap-24 overflow-x-auto">
          <button onClick={scrollToTop} className="text-brand-accent hover:text-brand-dark transition-colors whitespace-nowrap hidden sm:block">01 Home</button>
          <a href="#work" className="hover:text-brand-dark transition-colors whitespace-nowrap">02 Work</a>
          <a href="#services" className="hover:text-brand-dark transition-colors whitespace-nowrap">03 Services</a>
          <a href="#contact" className="hover:text-brand-dark transition-colors whitespace-nowrap">04 Contact</a>
        </div>
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-brand-dark text-white flex items-center justify-center transition-colors hover:bg-brand-accent border-l-2 border-brand-border"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12l7-7l7 7m-7 7V5"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
