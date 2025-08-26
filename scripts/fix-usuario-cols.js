const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Checking columns for Usuario...');
    const cols = await prisma.$queryRaw`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Usuario'`;
    const colNames = cols.map(c => c.COLUMN_NAME);
    console.log('Existing columns:', colNames.join(', '));

    if (!colNames.includes('nomeCompleto')) {
      console.log('nomeCompleto missing — adding column...');
      await prisma.$executeRawUnsafe("ALTER TABLE Usuario ADD COLUMN nomeCompleto VARCHAR(255) NULL;");
      console.log('Added nomeCompleto.');
    } else {
      console.log('nomeCompleto already exists.');
    }

    // Ensure senhaProvisoria exists
    if (!colNames.includes('senhaProvisoria')) {
      console.log('senhaProvisoria missing — adding column (BOOLEAN DEFAULT false)...');
      await prisma.$executeRawUnsafe("ALTER TABLE Usuario ADD COLUMN senhaProvisoria TINYINT(1) NOT NULL DEFAULT 0;");
      console.log('Added senhaProvisoria.');
    } else {
      console.log('senhaProvisoria already exists.');
    }

    // Ensure primeiroAcesso exists
    if (!colNames.includes('primeiroAcesso')) {
      console.log('primeiroAcesso missing — adding column (BOOLEAN DEFAULT false)...');
      await prisma.$executeRawUnsafe("ALTER TABLE Usuario ADD COLUMN primeiroAcesso TINYINT(1) NOT NULL DEFAULT 0;");
      console.log('Added primeiroAcesso.');
    } else {
      console.log('primeiroAcesso already exists.');
    }

    const colsAfter = await prisma.$queryRaw`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Usuario'`;
    console.log('Columns after:', colsAfter.map(c => c.COLUMN_NAME).join(', '));
  } catch (err) {
    console.error('Error in fix script:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
