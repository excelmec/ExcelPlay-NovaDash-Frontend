import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Disables built-in image optimization
  },
};

export default nextConfig;
