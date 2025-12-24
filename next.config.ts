import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',

  // Security headers
  async headers() {
    // Build connect-src dynamically based on API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const connectSources = ["'self'"];

    // Add common local development URLs
    connectSources.push('http://127.0.0.1:8080');
    connectSources.push('http://localhost:8080');
    connectSources.push('https://127.0.0.1:8080');
    connectSources.push('https://localhost:8080');

    // Add the configured API URL if it's set and different from the defaults
    if (apiUrl && apiUrl !== '') {
      // Extract the origin (protocol + host + port) from the URL
      try {
        const url = new URL(apiUrl);
        const origin = url.origin;
        if (!connectSources.includes(origin)) {
          connectSources.push(origin);
        }
      } catch (e) {
        // If parsing fails, add the URL as-is
        if (!connectSources.includes(apiUrl)) {
          connectSources.push(apiUrl);
        }
      }
    }

    // Add wildcard for HTTPS
    connectSources.push('https:');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src ${connectSources.join(' ')}`,
              "frame-ancestors 'self'",
            ].join('; ')
          }
        ],
      },
    ];
  },
};

export default nextConfig;
