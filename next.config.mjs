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
