"use client";

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-1 sm:pt-2 pb-2 sm:pb-4 text-center px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary leading-tight mb-4 sm:mb-6 md:mb-8 tracking-tight">
        <span className="font-playfair italic font-medium">Start your</span>{' '}
        <span className="font-sans font-medium tracking-tighter">career journey</span>
        <br />
        <span className="font-sans font-medium tracking-tighter">with</span>{' '}
        <span className="font-playfair italic font-medium">us</span>
      </h1>
      <div className="max-w-2xl mx-auto text-secondary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-light mb-2 sm:mb-3 md:mb-4 px-2">
        <p>
          We invest in the next generation of talent with internships, part-time roles, and projects built for ambitious students.
        </p>
      </div>
      <div className="text-center">
        <p className="text-[11px] sm:text-xs text-secondary/70 dark:text-secondary/60 font-light uppercase tracking-widest">
          Meet Our Students
        </p>
      </div>
    </header>
  );
};

export default Header;
