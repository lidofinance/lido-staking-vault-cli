import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@chainsafe/blst', 'blessed', 'pty.js', 'term.js'],
  async rewrites() {
    return [];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude CLI folder from webpack processing
      config.externals = config.externals || [];
      config.externals.push({
        // Exclude any files in cli directory
        '../cli': 'commonjs ../cli',
        './cli': 'commonjs ./cli',
        'cli/': 'commonjs cli/',
        // Exclude problematic terminal modules
        'pty.js': 'commonjs pty.js',
        'term.js': 'commonjs term.js',
        blessed: 'commonjs blessed',
      });

      // Add fallbacks for missing modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pty.js': false,
        'term.js': false,
      };
    }

    return config;
  },
};

export default nextConfig;
