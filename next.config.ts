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
    JWT_SECRET: process.env.JWT_SECRET || 'temporary-build-secret',
    CLIENT_DOC_ENCRYPTION_KEY_BASE64: process.env.CLIENT_DOC_ENCRYPTION_KEY_BASE64,
    CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS: process.env.CLIENT_DOC_ENCRYPTION_KEY_FALLBACKS,
  },
  // Desabilitar static optimization para rotas que usam dados dinâmicos
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Configurações específicas para evitar problemas durante build
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
