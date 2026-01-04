import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // basePath is required for rewrites from main domain (thefestaevents.com/admin)
  basePath: '/admin',
  experimental: {
    typedRoutes: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "../website/attached_assets"),
    };
    return config;
  },
};

export default nextConfig;
