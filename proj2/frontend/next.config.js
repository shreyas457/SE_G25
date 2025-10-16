/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },

  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://backend:8000/api/:path*' },
    ];
  },
};

module.exports = nextConfig;
