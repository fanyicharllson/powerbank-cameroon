/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@stael/db"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
