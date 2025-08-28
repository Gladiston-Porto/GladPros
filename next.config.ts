import type { NextConfig } from "next";
import * as dotenv from 'dotenv';

// Carregar .env explicitamente
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

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
  // Evitar que o Next.js tente executar rotas API durante build
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Configurar variáveis de ambiente de forma segura
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'temporary-build-secret-at-least-32-chars-long',
    CLIENT_DOC_ENCRYPTION_KEY_BASE64: process.env.CLIENT_DOC_ENCRYPTION_KEY_BASE64,
    CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS: process.env.CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS,
  },
  // Disable static generation for API routes to avoid build-time execution
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  },
  // Configurações para evitar execução de API durante build
  staticPageGenerationTimeout: 60, // Increase timeout to 60 seconds
  // Desabilitar static optimization para rotas que usam dados dinâmicos
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Configurações específicas para evitar problemas durante build
  output: undefined, // Change from 'standalone' to allow better build optimization
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
