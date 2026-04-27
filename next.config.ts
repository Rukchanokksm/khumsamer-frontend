import type { NextConfig } from "next";
import path from "path";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${BACKEND_URL}/api/auth/:path*`,
      },
      {
        source: "/api/vehicles/:path*",
        destination: `${BACKEND_URL}/api/vehicles/:path*`,
      },
      {
        source: "/api/car-expenses/:path*",
        destination: `${BACKEND_URL}/api/car-expenses/:path*`,
      },
      {
        source: "/api/travel-expenses/:path*",
        destination: `${BACKEND_URL}/api/travel-expenses/:path*`,
      },
    ];
  },
};

export default nextConfig;
