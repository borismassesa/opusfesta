"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { fetchJobPostings, JobPosting } from "@/lib/careers/jobs";
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setIsAuthenticated(false);
          return;
        }

        // Verify user exists in the database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        setIsAuthenticated(!userError && !!userData);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
      }
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      // Verify user exists in the database
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        setIsAuthenticated(!userError && !!userData);
      } catch (error) {
        console.error("Error verifying user:", error);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadJobs() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const jobPostings = await fetchJobPostings(token);
        setJobs(jobPostings.slice(0, 5)); // Show first 5 jobs
      } catch (err) {
        console.error("Error loading jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="py-24 md:py-32 max-w-4xl mx-auto px-6">
        <div className="text-center text-secondary">Loading positions...</div>
      </div>
    );
  }

  return (
    <div className="py-24 md:py-32 max-w-4xl mx-auto px-6">
       <motion.div 
         initial={{ opacity: 0, y: 10 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         className="mb-12"
       >
         <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
           <span className="w-12 h-px bg-accent"></span>
           <span className="font-mono text-accent text-xs tracking-widest uppercase">
             Opportunities
           </span>
           <span className="md:hidden w-12 h-px bg-accent"></span>
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4">
           <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary tracking-tight">Open roles</h2>
           <Link href="/careers/positions" className="text-base font-medium text-secondary hover:text-primary transition-colors flex items-center gap-2 group">
             View all positions 
             <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
           </Link>
         </div>
       </motion.div>
       
       <div className="flex flex-col">
         {jobs.length > 0 ? (
           jobs.map((job, i) => (
             <motion.div
               key={job.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.4, delay: i * 0.1 }}
             >
               <Link
                 href={isAuthenticated ? `/careers/${job.id}/apply` : `/login?next=${encodeURIComponent(`/careers/${job.id}/apply`)}`}
                 className="group flex items-center justify-between py-8 border-b border-border hover:bg-surface transition-all duration-300 px-6 -mx-6 rounded-xl cursor-pointer block"
               >
               <div>
                 <h3 className="text-xl md:text-2xl font-medium text-primary group-hover:text-accent transition-colors tracking-tight">{job.title}</h3>
                 <div className="flex gap-3 text-base text-secondary mt-2 font-light">
                   <span className="font-medium text-secondary">{job.department}</span>
                   <span className="text-border">&middot;</span>
                   <span>{job.location}</span>
                 </div>
               </div>
               <div className="flex items-center text-accent font-medium text-lg opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  {isAuthenticated ? "Apply" : "Log in to Apply"} <span className="ml-2">&rarr;</span>
               </div>
               </Link>
             </motion.div>
           ))
         ) : (
           <div className="text-center py-12 text-secondary">
             No open positions at the moment. Check back soon!
           </div>
         )}
       </div>
    </div>
  );
};

export default Jobs;
