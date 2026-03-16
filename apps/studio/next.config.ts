import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hoirqrkdgbmvpwutwuwj.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ppdapuqehwlfwofbpbvb.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
  },
  allowedDevOrigins: [
    'https://a33cfc1e-df7a-46d9-aeb4-26c3293a4d97-00-xv2puotyymok.spock.replit.dev',
    'http://a33cfc1e-df7a-46d9-aeb4-26c3293a4d97-00-xv2puotyymok.spock.replit.dev',
    '.spock.replit.dev',
    '.replit.dev',
  ],
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/studio-admin/:path*',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/studio-admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
};

export default nextConfig;
