import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // Increase limit to 5MB (or more if needed)
      allowedOrigins: [
        'localhost:3000', 
        '127.0.0.1:3000', 
        '192.168.0.103:3000'
      ]
    },
  },

  // ... any other config you have
};

export default nextConfig;