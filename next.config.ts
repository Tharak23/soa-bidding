import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    // User-supplied listing URLs (https://…) + local fallbacks.
    // `fill` + fixed aspect wrapper keeps every card identical;
    // high quality + sizes prevents blur / quality loss.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    qualities: [75, 85, 90, 100],
  },
  async rewrites() {
    const gateway = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${gateway}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
