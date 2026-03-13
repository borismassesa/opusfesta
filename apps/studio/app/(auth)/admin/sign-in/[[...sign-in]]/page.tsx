"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { BsArrowRight, BsGoogle, BsApple } from 'react-icons/bs';

export default function AdminSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('redirect_url') || '/admin';
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      router.replace(next);
    }
  }, [isSignedIn, next, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push(next);
      } else {
        setError('Sign in requires additional steps. Please contact support.');
        setIsLoading(false);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(clerkError?.longMessage || clerkError?.message || 'Invalid credentials. Please attempt again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#171717] flex items-center justify-center p-6 selection:bg-[#171717] selection:text-[#FDFBF7]" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="w-full max-w-[420px] flex flex-col pt-12 pb-24">
        
        {/* Monogram / Header */}
        <div className="mb-20 text-center flex flex-col items-center">
          <Link href="/" className="group flex flex-col items-center gap-6">
            <div className="relative flex h-[72px] w-[72px] items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <Image 
                src="/studio-logo.png" 
                alt="OpusStudio Logo" 
                width={40} 
                height={47} 
                unoptimized
                className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                priority
              />
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#8A7662]">OpusStudio</span>
              <span className="text-xs uppercase tracking-[0.35em] text-[#171717] font-light">Operations Center</span>
            </div>
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full">
          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 text-red-600 text-[10px] uppercase tracking-widest text-center transition-all duration-300">
              {error}
            </div>
          )}

          {/* Manual Credentials */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 relative">
            
            {/* Email Input */}
            <div className="relative group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="peer w-full bg-transparent border-b border-[#171717]/20 py-4 text-sm text-[#171717] placeholder-transparent focus:outline-none focus:border-[#171717] transition-colors duration-500 rounded-none"
              />
              <label
                htmlFor="email"
                className="absolute left-0 top-4 text-[10px] uppercase tracking-[0.25em] text-[#8A7662] transition-all duration-500 peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#171717] peer-valid:-top-4 peer-valid:text-[10px]"
              >
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative group mt-2">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className="peer w-full bg-transparent border-b border-[#171717]/20 py-4 text-sm tracking-widest text-[#171717] placeholder-transparent focus:outline-none focus:border-[#171717] transition-colors duration-500 rounded-none"
              />
              <label
                htmlFor="password"
                className="absolute left-0 top-4 text-[10px] uppercase tracking-[0.25em] text-[#8A7662] transition-all duration-500 peer-placeholder-shown:text-xs peer-placeholder-shown:top-4 peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-[#171717] peer-valid:-top-4 peer-valid:text-[10px]"
              >
                Password
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="group relative mt-10 flex h-[60px] w-full items-center justify-between border border-[#171717] bg-[#171717] px-6 text-white transition-colors duration-700 hover:bg-transparent hover:text-[#171717] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[11px] uppercase font-bold tracking-[0.3em] mt-0.5">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </span>
              {isLoading ? (
                <div className="flex items-center gap-[4px] mr-2">
                  <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-1.5 w-1.5 bg-white group-hover:bg-[#171717] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <BsArrowRight className="text-xl transition-transform duration-500 group-hover:translate-x-3" />
              )}
            </button>
          </form>

          {/* Footer text */}
          <div className="mt-24 text-center flex flex-col gap-5 items-center">
            <button className="text-[9px] uppercase tracking-[0.3em] text-[#8A7662] hover:text-[#171717] transition-colors duration-500 w-max border-b border-transparent hover:border-[#171717] pb-1">
              Recover Password
            </button>
            <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-[#171717]/50 mt-10">
              &copy; {new Date().getFullYear()} OpusStudio Operation
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
