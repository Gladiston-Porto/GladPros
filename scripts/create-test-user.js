const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUser() {
  const prisma = new PrismaClient();
  try {
    const email = 'admin@local.test';
    const plain = 'Admin@12345!';
    const hash = await bcrypt.hash(plain, 12);

    const user = await prisma.usuario.upsert({
      where: { email },
      update: {
        nomeCompleto: 'Admin Local',
        senha: hash,
        nivel: 'ADMIN',
        endereco1: 'Sede Principal, Av. Exemplo, 100',
        endereco2: 'Sala 1',
        cidade: 'Cidade Teste',
        estado: 'SP',
        zipcode: '00000-000',
        telefone: '11999999999',
        senhaProvisoria: false,
        primeiroAcesso: false,
      },
      create: {
        email,
        senha: hash,
        nivel: 'ADMIN',
        endereco1: 'Sede Principal, Av. Exemplo, 100',
        endereco2: 'Sala 1',
        cidade: 'Cidade Teste',
        estado: 'SP',
        zipcode: '00000-000',
        status: 'ATIVO',
        nomeCompleto: 'Admin Local',
        telefone: '11999999999',
        senhaProvisoria: false,
        primeiroAcesso: false,
      }
    });

    // Hide sensitive fields
    const safe = {
      id: user.id,
      email: user.email,
      nomeCompleto: user.nomeCompleto,
      nivel: user.nivel,
      status: user.status,
      telefone: user.telefone,
      criadoEm: user.criadoEm,
      atualizadoEm: user.atualizadoEm
    };

    console.log('Usuário criado/atualizado:');
    console.log(JSON.stringify(safe, null, 2));
    console.log('\nCredenciais de teste:');
    console.log(`email: ${email}`);
    console.log(`senha: ${plain}`);

  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
