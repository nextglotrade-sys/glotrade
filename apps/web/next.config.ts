import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds (run separately in CI/CD)
    ignoreDuringBuilds: true,
  },
  // typescript: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has type errors.
  //   ignoreBuildErrors: true,
  // },
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // Production optimizations
  compress: true, // Enable gzip compression

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compiler options for production
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'], // Keep console.error for critical debugging
    } : false,
  },

  // Performance optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'chart.js', 'react-chartjs-2'],
  },

  async redirects() {
    return [
      {
        source: '/vendor/coupons',
        destination: '/admin/coupons',
        permanent: true,
      },
      {
        source: '/vendor/store',
        destination: '/admin/store',
        permanent: true,
      },
      {
        source: '/vendor/products',
        destination: '/admin/products',
        permanent: true,
      },
      {
        source: '/vendor',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/vendor/:path*',
        destination: '/admin',
        permanent: true,
      },
    ];
  },

  // Add edge caching headers for marketplace route to reduce data transfer
  async headers() {
    return [
      {
        source: '/marketplace',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/marketplace/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/marketplace/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

