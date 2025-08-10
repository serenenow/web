/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_DEBUG: process.env.NEXT_PUBLIC_API_DEBUG,
  },
  async redirects() {
    return [
      {
        source: '/delete-your-data.html',
        destination: '/delete-your-data',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
