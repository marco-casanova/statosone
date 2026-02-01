/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile workspace packages
  transpilePackages: [
    "@stratos/auth",
    "@stratos/marketing",
    "@stratos/ui",
    "@stratos/utils",
  ],

  // Output standalone for better Vercel performance
  output: "standalone",

  // Enable React strict mode
  reactStrictMode: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Allow image domains for Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
