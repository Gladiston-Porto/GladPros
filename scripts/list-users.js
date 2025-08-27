const { PrismaClient } = require('@prisma/client');

async function listUsers() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.usuario.findMany({
      select: { id: true, nomeCompleto: true, email: true, nivel: true, status: true, telefone: true, criadoEm: true, atualizadoEm: true }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('ERROR', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
