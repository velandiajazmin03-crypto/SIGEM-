/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress excessive MySql connection error logs during dev
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
