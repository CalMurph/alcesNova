import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['10.151.0.187', '10.151.0.176'],
  experimental: {
    agentFeedback: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://10.151.0.58:3000/api/:path*",
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
