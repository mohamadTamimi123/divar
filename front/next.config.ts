import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    env : {
        api_path: "http://127.0.0.1:5001",
    },
    images: {
        remotePatterns: [new URL('http://127.0.0.1:5001/images/**')],
    },
};

export default nextConfig;
