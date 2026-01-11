"use client";

import React from 'react';
import Values from './Values';
import Benefits from './Benefits';
import EmployeeStories from './EmployeeStories';
import Jobs from './Jobs';
import Process from './Process';
import CareersCTA from './CareersCTA';

export function CultureValues() {
  return (
    <>
      {/* Culture & Values */}
      <Values />

      {/* Benefits Section */}
      <Benefits />

      {/* Employee Stories */}
      <EmployeeStories />

      {/* Open Roles */}
      <Jobs />

      {/* Hiring Process */}
      <Process />

      {/* Bottom CTA */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 mb-12 sm:mb-20">
        <CareersCTA />
      </div>
    </>
  );
}
