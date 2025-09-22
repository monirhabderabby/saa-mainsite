/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "files.edgestore.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year
          },
        ],
      },
      {
        source: "/api/users",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=300", // 5 minutes
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=300", // For specific CDN providers
          },
        ],
      },
      {
        source: "/api/update-entries",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300", // 1 minute
          },
        ],
      },
      {
        source: "/api/issue-sheets",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300", // 1 minute
          },
        ],
      },
    ];
  },
};

export default nextConfig;
