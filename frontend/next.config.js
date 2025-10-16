/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-railway-domain.railway.app'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  // Remove experimental appDir as it's now stable in Next.js 14
  // experimental: {
  //   appDir: true,
  // },
}

module.exports = nextConfig
