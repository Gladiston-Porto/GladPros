const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUser() {
  const prisma = new PrismaClient();
  try {
    const email = 'gladiston.porto@gladpros.com';
    const plain = '030919@Gladpros';
    const hash = await bcrypt.hash(plain, 12);

    const user = await prisma.usuario.upsert({
      where: { email },
      update: {
        nomeCompleto: 'Gladiston Porto',
        senha: hash,
        nivel: 'ADMIN',
        endereco1: 'GladPros HQ',
  endereco2: '',
        cidade: 'São Paulo',
        estado: 'SP',
        zipcode: '00000-000',
        telefone: '11900000000',
        senhaProvisoria: false,
        primeiroAcesso: false,
        status: 'ATIVO'
      },
      create: {
        email,
        senha: hash,
        nivel: 'ADMIN',
        endereco1: 'GladPros HQ',
  endereco2: '',
        cidade: 'São Paulo',
        estado: 'SP',
        zipcode: '00000-000',
        status: 'ATIVO',
        nomeCompleto: 'Gladiston Porto',
        telefone: '11900000000',
        senhaProvisoria: false,
        primeiroAcesso: false,
      }
    });

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
    console.log('\nCredenciais fornecidas (use apenas para desenvolvimento):');
    console.log(`email: ${email}`);
    console.log(`senha: ${plain}`);

  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
