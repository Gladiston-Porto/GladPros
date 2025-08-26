// test-data.js - Script para criar dados de teste
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Criando dados de teste...');

    // Criar cliente de teste
    const cliente = await prisma.cliente.upsert({
      where: { email: 'teste@empresa.com' },
      update: {},
      create: {
        tipo: 'PJ',
        nomeCompleto: null,
        nomeFantasia: 'Empresa Teste',
        razaoSocial: 'Empresa Teste Ltda',
        email: 'teste@empresa.com',
        telefone: '11999887766',
        nomeChave: 'EMPRESA TESTE LTDA',
        endereco1: 'Rua Teste 123',
        cidade: 'São Paulo',
        estado: 'SP',
        zipcode: '01234567',
        status: 'ATIVO'
      }
    });

    console.log('Cliente criado:', cliente);

    // Verificar se o modelo Proposta está disponível
    if (prisma.proposta) {
      console.log('Modelo Proposta disponível! Criando proposta de teste...');

      const proposta = await prisma.proposta.create({
        data: {
          numeroProposta: 'GP-202508-00001',
          clienteId: cliente.id,
          tipoServico: 'Desenvolvimento de Software',
          permite: 'NAO',
          status: 'RASCUNHO',
          valorEstimado: 15000.00,
          etapas: {
            create: [
              {
                servico: 'Análise e Planejamento',
                descricao: 'Levantamento de requisitos e planejamento do projeto',
                ordem: 0,
                status: 'PLANEJADA'
              },
              {
                servico: 'Desenvolvimento',
                descricao: 'Desenvolvimento da aplicação',
                ordem: 1,
                status: 'PLANEJADA'
              }
            ]
          },
          materiais: {
            create: [
              {
                nome: 'Licença de Software',
                quantidade: 1,
                unidade: 'un',
                precoUnitario: 500.00,
                status: 'PLANEJADO'
              }
            ]
          }
        }
      });

      console.log('Proposta criada:', proposta);
    } else {
      console.log('Modelo Proposta NÃO está disponível no Prisma Client');
      console.log('Modelos disponíveis:', Object.keys(prisma).filter(key => typeof prisma[key] === 'object' && prisma[key].findMany));
    }

  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
