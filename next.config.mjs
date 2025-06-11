/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  distDir: 'out',
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
