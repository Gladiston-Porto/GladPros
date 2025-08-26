const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const email = 'smoke@gladpros.local';
    const user = await prisma.usuario.upsert({
      where: { email },
      update: { nivel: 'ADMIN', status: 'ATIVO', cidade: 'São Paulo' },
      create: {
        email,
        senha: 'x',
        nivel: 'ADMIN',
        status: 'ATIVO',
        endereco1: 'Rua Teste',
        endereco2: '',
        cidade: 'São Paulo'
      }
    });
    console.log('Seeded smoke user id:', user.id);
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
