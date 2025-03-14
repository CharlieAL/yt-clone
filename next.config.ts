import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ma35qgh0nd.ufs.sh'
      }
    ]
  }
}

export default nextConfig
