/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@stratos/auth",
    "@stratos/marketing",
    "@stratos/ui",
    "@stratos/utils",
    "@stratos/config",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // or higher if needed
    },
  },
};

export default nextConfig;
