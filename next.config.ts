import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  // Allow Vercel to handle all routing
  trailingSlash: false,
};

export default nextConfig;
