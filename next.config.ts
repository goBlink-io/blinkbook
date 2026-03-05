import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@goblink/connect"],
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
