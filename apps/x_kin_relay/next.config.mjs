import createNextIntlPlugin from "next-intl/plugin";

// Auto-detects next-intl.config.ts at the project root
const withNextIntl = createNextIntlPlugin();

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

  // Use SWC minifier (faster)
  swcMinify: true,

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
