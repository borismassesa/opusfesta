"use client";

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-12 sm:pt-16 pb-8 sm:pb-12 text-center px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 sm:mb-8 md:mb-10 tracking-tight">
        <span className="font-playfair italic font-medium">Start your</span>{' '}
        <span className="font-sans font-medium tracking-tighter">career journey</span>
        <br />
        <span className="font-sans font-medium tracking-tighter">with</span>{' '}
        <span className="font-playfair italic font-medium">us</span>
      </h1>
      <div className="max-w-3xl mx-auto text-secondary text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed font-light mb-8 sm:mb-10 md:mb-12 px-2">
        <p>
          We believe in investing in the next generation of talent. Whether you're looking for an internship, part-time work, or project-based opportunities, we have something for ambitious students ready to make an impact.
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs sm:text-sm text-secondary/70 dark:text-secondary/60 font-light uppercase tracking-widest">
          Meet Our Students
        </p>
      </div>
    </header>
  );
};

export default Header;
