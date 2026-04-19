/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "image.made-in-china.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5185",
      },
    ],
  },
};

module.exports = nextConfig;
