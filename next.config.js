/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    serverComponentsExternalPackages: ['node-ical', 'rrule-temporal', 'temporal-polyfill'],
  },
}

module.exports = nextConfig
