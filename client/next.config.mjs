/* eslint-disable */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Mengizinkan Next.js Image Optimization untuk unoptimized local assets
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001", // Port backend Anda
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dobrmzovncvkqqilkvcv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;