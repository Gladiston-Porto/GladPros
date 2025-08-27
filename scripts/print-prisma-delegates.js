const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const keys = Object.keys(prisma).filter((k) => !k.startsWith('$'));
    console.log(keys.sort());
  } finally {
    await prisma.$disconnect();
  }
})();
