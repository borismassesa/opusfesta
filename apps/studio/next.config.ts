import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hoirqrkdgbmvpwutwuwj.supabase.co',
      },
    ],
  },
  allowedDevOrigins: [
    'https://a33cfc1e-df7a-46d9-aeb4-26c3293a4d97-00-xv2puotyymok.spock.replit.dev',
    'http://a33cfc1e-df7a-46d9-aeb4-26c3293a4d97-00-xv2puotyymok.spock.replit.dev',
    '.spock.replit.dev',
    '.replit.dev',
  ],
};

export default nextConfig;
