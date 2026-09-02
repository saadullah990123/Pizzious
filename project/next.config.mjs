/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Was hostname: '**' (any HTTPS host) — the image optimizer would fetch
    // and resize an image from anywhere on request, which is both an SSRF-
    // style abuse surface and an uncapped CPU/bandwidth sink. Locked down to
    // the hosts actually used in this codebase today (product photos come
    // from Unsplash; everything else is served from this app's own domain,
    // which next/image always allows). If you add a new remote image source
    // (e.g. a Supabase Storage bucket or S3), add its hostname here too.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days — product photos rarely change
  },
  async headers() {
    return [
      {
        // Applies to every route, including /admin/*
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // Static brand assets (logo badges, hero photo, fonts) rarely change —
        // let browsers cache them for a year instead of re-fetching every visit.
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;