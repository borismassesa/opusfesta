"use client";

import React from 'react';
import Values from './Values';
import Benefits from './Benefits';
import Process from './Process';
import CareersCTA from './CareersCTA';
import { Team } from './Team';

export function CultureValues() {
  return (
    <>
      {/* Culture & Values */}
      <Values />

      {/* Benefits Section */}
      <Benefits />

      {/* About Our Team */}
      <Team />

      {/* Hiring Process */}
      <Process />

      {/* Bottom CTA */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 mb-12 sm:mb-20">
        <CareersCTA />
      </div>
    </>
  );
}
