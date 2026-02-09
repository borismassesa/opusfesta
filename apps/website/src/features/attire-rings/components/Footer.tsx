import React from 'react';
import { Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2F466C] text-white mt-20">
      <div className="max-w-[1560px] mx-auto px-5 md:px-16 lg:px-24 py-12">
        <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-[#3D567E] p-4 rounded-xl mb-8 w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="font-bold text-lg text-center sm:text-left">Yes! Send me exclusive offers, unique gift ideas, and personalized tips for shopping and selling on OpusFesta.</div>
                <div className="relative w-full sm:w-auto shrink-0">
                    <input type="email" placeholder="Enter your email" className="w-full sm:w-64 rounded-full py-2 px-4 text-gray-900 outline-none border-2 border-transparent focus:border-white" />
                    <button className="absolute right-1 top-1 bottom-1 bg-[#2F466C] text-white px-4 rounded-full text-sm font-bold hover:bg-opacity-90">Subscribe</button>
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
               <Globe size={20} />
               <span className="font-medium underline decoration-1 underline-offset-4 cursor-pointer">Tanzania</span>
               <span className="mx-2">|</span>
               <span className="font-medium underline decoration-1 underline-offset-4 cursor-pointer">English</span>
               <span className="mx-2">|</span>
               <span className="font-medium underline decoration-1 underline-offset-4 cursor-pointer">TSh (TZS)</span>
            </div>

            <p className="text-sm opacity-80">© 2026 OpusFesta, Inc.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm underline opacity-80">
                <a href="#">Terms of Use</a>
                <a href="#">Privacy</a>
                <a href="#">Interest-based ads</a>
            </div>
        </div>
      </div>
    </footer>
  );
};