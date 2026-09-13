import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
config({ path: resolve(rootDir, '.env') })
config({ path: resolve(rootDir, '.env.local') })

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
