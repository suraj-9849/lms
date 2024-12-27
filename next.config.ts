/** @type {import('next').NextConfig} */
const nextConfig = {
  // The http: images were causing the error so need to place the remotePatterns: to get rid of the errors:
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

