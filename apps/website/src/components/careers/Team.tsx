"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Person } from './types';
import { FacebookIcon, TwitterIcon, GithubIcon, InstagramIcon } from './constants';

const TEAM_DATA: Person[] = [
  {
    id: '1',
    name: 'Phillip Bothman',
    role: 'CEO & Founder',
    bio: '"Phillip is the visionary founder and CEO, passionate about building scalable web applications and leading teams to deliver high-quality software. He enjoys mentoring junior developers and exploring new technologies."',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000',
    socials: { facebook: '#', twitter: '#', github: '#', instagram: '#' }
  },
  {
    id: '2',
    name: 'Mike Lee',
    role: 'Frontend Developer',
    bio: '"Mike specializes in crafting beautiful and performant user interfaces using React and TypeScript. She loves collaborating with designers to create seamless user experiences."',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000',
    socials: { facebook: '#', twitter: '#', github: '#', instagram: '#' }
  },
  {
    id: '3',
    name: 'Emily Park',
    role: 'UI/UX Designer',
    bio: '"Emily is dedicated to designing intuitive and engaging digital experiences. She combines creativity with user research to deliver interfaces that delight users."',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000',
    socials: { facebook: '#', twitter: '#', github: '#', instagram: '#' }
  },
  {
    id: '4',
    name: 'Michael Chen',
    role: 'Backend Developer',
    bio: '"Michael focuses on building robust APIs and microservices. He is experienced with Node.js, databases, and cloud infrastructure, ensuring reliability and scalability."',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000',
    socials: { facebook: '#', twitter: '#', github: '#', instagram: '#' }
  }
];

const Sidebar: React.FC<{ person: Person }> = ({ person }) => {
  return (
    <div className="flex flex-col justify-center h-full w-full px-6 py-12 sm:py-14 md:py-16 transition-all duration-500 ease-in-out">
      <div className="w-full mb-2">
        <h1 className="text-2xl sm:text-3xl md:text-2xl lg:text-4xl xl:text-5xl font-extrabold text-primary leading-none whitespace-nowrap overflow-hidden text-ellipsis">
          {person.name}
        </h1>
      </div>
      <p className="text-base sm:text-lg lg:text-xl text-secondary font-medium mb-6">
        {person.role}
      </p>
      
      <div className="flex gap-5 mb-10">
        <a href={person.socials.facebook} className="text-secondary/60 hover:text-blue-600 hover:scale-110 transition-all duration-300" aria-label="Facebook">
          <FacebookIcon />
        </a>
        <a href={person.socials.twitter} className="text-secondary/60 hover:text-blue-400 hover:scale-110 transition-all duration-300" aria-label="Twitter">
          <TwitterIcon />
        </a>
        <a href={person.socials.github} className="text-secondary/60 hover:text-primary hover:scale-110 transition-all duration-300" aria-label="Github">
          <GithubIcon />
        </a>
        <a href={person.socials.instagram} className="text-secondary/60 hover:text-pink-600 hover:scale-110 transition-all duration-300" aria-label="Instagram">
          <InstagramIcon />
        </a>
      </div>

      <div className="max-w-md lg:max-w-lg relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 rounded-full"></div>
        <p className="text-secondary text-base sm:text-lg leading-relaxed italic pl-6 py-2">
          {person.bio}
        </p>
      </div>
    </div>
  );
};

const GalleryItem: React.FC<{ 
  person: Person, 
  isActive: boolean, 
  onClick: () => void,
  onMouseEnter: () => void
}> = ({ person, isActive, onClick, onMouseEnter }) => {
  return (
    <div 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`relative cursor-pointer transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden h-full group ${
        isActive ? 'flex-4' : 'flex-1 hover:flex-[1.1]'
      }`}
    >
      <img 
        src={person.imageUrl} 
        alt={person.name}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 z-0 ${
          isActive ? 'grayscale-0 scale-100 brightness-100' : 'grayscale brightness-[0.35] group-hover:brightness-75 group-hover:grayscale-0 scale-110 group-hover:scale-105'
        }`}
      />
      
      {/* Name tag for non-active items */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
           <span className="text-white font-bold text-[10px] tracking-[0.25em] whitespace-nowrap [writing-mode:vertical-rl] rotate-180 uppercase bg-black/30 backdrop-blur-sm py-4 px-1">
            {person.name}
          </span>
        </div>
      )}
      
      {/* Active Indicator Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-primary transition-transform duration-700 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}></div>
    </div>
  );
};

export const Team: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="py-24 md:py-32 w-full">
      <div className="max-w-6xl mx-auto px-6 mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <span className="w-12 h-px bg-accent"></span>
            <span className="font-mono text-accent text-xs tracking-widest uppercase">
              Our Team
            </span>
            <span className="md:hidden w-12 h-px bg-accent"></span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight mb-6">
            About our team
          </h2>
          <p className="text-base md:text-lg text-secondary leading-relaxed font-light">
            Meet the talented individuals who make OpusFesta possible. We're a diverse team passionate about making celebrations accessible and meaningful across Tanzania.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row min-h-[500px] md:min-h-[600px] lg:min-h-[650px] w-full overflow-hidden bg-background selection:bg-accent/20">
          
          {/* Gallery Section - Top on mobile, Right on desktop */}
          <div className="w-full md:w-[55%] lg:w-[58%] h-[400px] md:h-[600px] lg:h-[650px] order-1 md:order-2 flex flex-row overflow-hidden bg-gray-950 relative pr-0 md:pr-6">
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] z-0"></div>
            {TEAM_DATA.map((person, index) => (
              <GalleryItem 
                key={person.id}
                person={person}
                isActive={activeIndex === index}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
              />
            ))}
          </div>

          {/* Profile Info Section - Bottom on mobile, Left on desktop */}
          <div className="w-full md:w-[45%] lg:w-[42%] h-[500px] md:h-[600px] lg:h-[650px] order-2 md:order-1 flex items-center bg-background z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
            <Sidebar person={TEAM_DATA[activeIndex]} />
          </div>
        </div>

        {/* Mobile Page Indicator Overlay */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-3 md:hidden z-30 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          {TEAM_DATA.map((_, index) => (
            <button 
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeIndex === index ? 'bg-white w-6' : 'bg-white/40'}`}
              aria-label={`Go to team member ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
