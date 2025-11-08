/** @type {import('next').NextConfig} */
module.exports = {
  // Only use standalone in production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Enable polling for Docker environments
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
};
