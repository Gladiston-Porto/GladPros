const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Checking/adding Usuario.ultimoLoginEm column...');
    const cols = await prisma.$queryRawUnsafe(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Usuario'
    `);
    const has = new Set(cols.map((c) => String(c.COLUMN_NAME)));
    if (!has.has('ultimoLoginEm')) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE Usuario 
        ADD COLUMN ultimoLoginEm DATETIME NULL AFTER atualizadoEm
      `);
      console.log('Added Usuario.ultimoLoginEm');
    } else {
      console.log('Usuario.ultimoLoginEm already exists');
    }
  } catch (err) {
    console.error('Error ensuring Usuario.ultimoLoginEm:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
