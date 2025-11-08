import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude contracts folder from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
