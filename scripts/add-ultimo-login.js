const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Verificando e adicionando coluna ultimoLoginEm...');
    
    // Verificar se a coluna já existe
    const cols = await prisma.$queryRaw`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Usuario'
      AND COLUMN_NAME = 'ultimoLoginEm'
    `;

    if (cols.length === 0) {
      console.log('Coluna ultimoLoginEm não existe, adicionando...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE Usuario 
        ADD COLUMN ultimoLoginEm DATETIME NULL
      `);
      console.log('✅ Coluna ultimoLoginEm adicionada');
    } else {
      console.log('✅ Coluna ultimoLoginEm já existe');
    }

  } catch (err) {
    console.error('Erro ao verificar/adicionar ultimoLoginEm:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
