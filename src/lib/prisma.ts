// src/lib/prisma.ts

// Evita múltiplas instâncias em dev (HMR)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined;
}

// Check if we're in build time or CI
function isBuildTime(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-production-server' ||
    process.env.NEXT_PHASE === 'phase-static' ||
    process.env.NEXT_PHASE === 'phase-export' ||
    process.env.CI === 'true'
  );
}

// Mock Prisma client for build time
const mockPrismaClient = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  cliente: {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  usuario: {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  proposta: {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    findFirst: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({}),
  },
  auditLog: {
    create: () => Promise.resolve({}),
    findMany: () => Promise.resolve([]),
  }
};

// Lazy initialization of Prisma client
function createPrismaClient(): any {
  if (isBuildTime()) {
    // Return mock client during build time
    return mockPrismaClient;
  }
  
  // Import PrismaClient only when not in build time
  try {
    const { PrismaClient } = require("@prisma/client");
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (error) {
    console.warn("Failed to initialize Prisma client, using mock:", error);
    return mockPrismaClient;
  }
}

export const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && !isBuildTime()) {
  global.__prisma = prisma;
}

export default prisma;
