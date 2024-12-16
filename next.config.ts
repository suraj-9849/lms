/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

