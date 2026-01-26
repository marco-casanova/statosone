/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@stratos/auth",
    "@stratos/marketing",
    "@stratos/ui",
    "@stratos/utils",
    "@stratos/config",
  ],
};

export default nextConfig;
