import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['@chainsafe/blst'],
  },
  webpack: (config) => {
    // Exclude CLI folder from webpack processing
    config.module.rules.push({
      test: /\.(ts|js)$/,
      exclude: /cli\//,
      use: {
        loader: 'ignore-loader',
      },
    });

    return config;
  },
};

export default nextConfig;
