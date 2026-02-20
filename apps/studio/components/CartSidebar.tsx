'use client';

import Image from 'next/image';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-brand-dark/60" onClick={onClose}></div>
      <div
        className={`absolute right-0 top-0 bottom-0 w-96 bg-brand-bg border-l-4 border-brand-border transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-brand-border">
            <h3 className="text-brand-dark font-bold uppercase tracking-wider text-sm">
              Active Bookings
            </h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-brand-dark">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-auto pr-2">
            <div className="space-y-6">
              <div className="flex gap-4 pb-6 border-b-2 border-brand-border">
                <div className="w-20 h-24 border-2 border-brand-border overflow-hidden relative">
                  <Image
                    src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/41438a62-3777-4cae-924c-e588db59dba3_320w.webp"
                    alt="Project Thumbnail"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-brand-dark uppercase tracking-wide">
                    Summer Wedding Film
                  </p>
                  <p className="text-[10px] font-mono text-brand-accent mt-1">
                    STATUS: IN PROGRESS
                  </p>
                  <p className="text-sm font-bold text-neutral-600 mt-2">Est. £4,500</p>
                </div>
                <button className="text-neutral-400 hover:text-brand-accent self-start transition-colors">
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
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-brand-border pt-6 mt-4">
            <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-3">
              <span className="text-neutral-500">Next Shoot</span>
              <span className="font-bold text-brand-dark">March 15</span>
            </div>
            <div className="flex justify-between text-lg mb-8">
              <span className="font-bold text-brand-dark tracking-tight">DEPOSIT PAID</span>
              <span className="font-bold text-brand-accent font-mono">£1,500</span>
            </div>
            <button className="w-full py-4 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-accent transition-colors mb-3">
              View Bookings
            </button>
            <button className="w-full py-4 border-2 border-brand-border text-brand-dark text-xs font-bold uppercase tracking-widest hover:border-brand-accent hover:text-brand-accent transition-colors">
              Book a Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
