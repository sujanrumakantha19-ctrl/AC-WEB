import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  async redirects() {
    return [
      {
        source: "/contact-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-1",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/new-page-2",
        destination: "/auctions",
        permanent: true,
      },
      {
        source: "/new-page-1",
        destination: "/auctions",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
