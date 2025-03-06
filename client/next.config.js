/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    },
  },
  // Keep any other existing config options
  images: {
    domains: ['uploadthing.com', 'utfs.io']
  }
}

module.exports = nextConfig 