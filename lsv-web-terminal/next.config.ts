import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@chainsafe/blst'],
  webpack: (config) => {
    // Exclude CLI folder from webpack processing
    config.externals = config.externals || [];
    config.externals.push({
      // Exclude any files in cli directory
      '../cli': 'commonjs ../cli',
      './cli': 'commonjs ./cli',
      'cli/': 'commonjs cli/',
    });

    return config;
  },
};

export default nextConfig;
