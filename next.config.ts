/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverExternalPackages: ['bcryptjs', '@prisma/client', 'prisma'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        process: false,
        util: false,
        buffer: false,
        'pino-pretty': false,
        'mock-aws-s3': false,
        child_process: false,
        net: false,
        tls: false,
        aws4: false,
        'fs/promises': false,
        '@mapbox/node-pre-gyp': false,
        'aws-sdk': false,
        'nock': false
      };
    }
    return config;
  },
};

module.exports = nextConfig;