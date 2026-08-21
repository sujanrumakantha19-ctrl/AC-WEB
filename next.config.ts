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
  },
  async redirects() {
    return [
      {
        source: "/contact-us",
        destination: "/",
        permanent: true,
      },
      {
        source: "/contact-1",
        destination: "/",
        permanent: true,
      },
      {
        source: "/new-page-2",
        destination: "/",
        permanent: true,
      },
      {
        source: "/new-page-1",
        destination: "/",
        permanent: true,
      },
      {
        source: "/cancellations-and-refunds",
        destination: "/",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/",
        permanent: true,
      },
      {
        source: "/shipping-policy",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
