import type { NextConfig } from "next";
import * as dotenv from 'dotenv';

// Carregar .env explicitamente
dotenv.config({ path: '.env' });

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_DOC_ENCRYPTION_KEY_BASE64: process.env.CLIENT_DOC_ENCRYPTION_KEY_BASE64,
    CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS: process.env.CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS,
  },
};

export default nextConfig;
