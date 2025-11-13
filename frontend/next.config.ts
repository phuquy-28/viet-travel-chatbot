import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper routing for client-side navigation
  trailingSlash: false,
  // Enable static page generation where possible
  output: undefined, // Let Vercel handle this automatically
};

export default nextConfig;
