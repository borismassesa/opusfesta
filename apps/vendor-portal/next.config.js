/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath removed - using subdomain (vendors.opusfestaevents.com) instead of path-based routing
  // basePath: '/vendors',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'your-s3-bucket.s3.amazonaws.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
