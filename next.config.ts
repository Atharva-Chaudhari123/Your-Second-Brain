import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // Increase limit to 5MB (or more if needed)
    },
  },
  // ... any other config you have
};

export default nextConfig;