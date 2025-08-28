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

module.exports = {
  PrismaClient: function() {
    return mockPrismaClient;
  }
};