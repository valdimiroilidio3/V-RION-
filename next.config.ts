import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // the preview environment proxies the dev server from another origin
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost"],
};

export default nextConfig;
