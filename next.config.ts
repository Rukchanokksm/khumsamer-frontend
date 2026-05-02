import type { NextConfig } from "next";
import path from "path";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

// `:path*` เมื่อว่างจะสร้าง trailing slash ที่ destination → ทำให้เกิด 308
// แก้โดยแยก base path (ไม่มี sub-path) และ sub-path ออกจากกัน
function proxy(prefix: string) {
  return [
    { source: `/api/${prefix}`, destination: `${BACKEND_URL}/api/${prefix}` },
    { source: `/api/${prefix}/:path+`, destination: `${BACKEND_URL}/api/${prefix}/:path+` },
  ];
}

const nextConfig: NextConfig = {
  trailingSlash: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      ...proxy("auth"),
      ...proxy("vehicles"),
      ...proxy("car-expenses"),
      ...proxy("travel-expenses"),
      ...proxy("bills"),
      ...proxy("garages"),
      ...proxy("car-repairs"),
      ...proxy("car-wash-places"),
    ];
  },
};

export default nextConfig;
