// Script para testar o sistema de auditoria e segurança
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Testando sistema de auditoria e segurança...\n');

  try {
    // 1. Verificar se as tabelas de segurança existem
    console.log('📊 Verificando tabelas de segurança:');
    
    const tentativas = await prisma.tentativaLogin.count();
    console.log(`  ✅ TentativaLogin: ${tentativas} registros`);
    
    const sessoes = await prisma.sessaoAtiva.count();
    console.log(`  ✅ SessaoAtiva: ${sessoes} registros`);
    
    const historico = await prisma.historicoSenha.count();
    console.log(`  ✅ HistoricoSenha: ${historico} registros`);
    
    const auditorias = await prisma.auditoria.count();
    console.log(`  ✅ Auditoria: ${auditorias} registros`);

    // 2. Testar criação de auditoria
    console.log('\n📝 Testando criação de log de auditoria...');
    await prisma.auditoria.create({
      data: {
        tabela: 'system',
        registroId: 1,
        acao: 'LOGIN',
        usuarioId: 1,
        ip: '127.0.0.1',
        payload: JSON.stringify({
          action: 'TEST_AUDIT',
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        })
      }
    });
    console.log('  ✅ Log de auditoria criado com sucesso');

    // 3. Testar tentativa de login
    console.log('\n🔐 Testando registro de tentativa de login...');
    const user = await prisma.usuario.findFirst({ where: { status: 'ATIVO' } });
    if (user) {
      await prisma.tentativaLogin.create({
        data: {
          usuarioId: user.id,
          email: user.email,
          sucesso: true,
          ip: '127.0.0.1',
          userAgent: 'Test-Agent'
        }
      });
      console.log(`  ✅ Tentativa de login registrada para ${user.email}`);
    } else {
      console.log('  ⚠️ Nenhum usuário ativo encontrado');
    }

    // 4. Testar criação de sessão ativa  
    console.log('\n🌐 Testando criação de sessão ativa...');
    if (user) {
      const token = require('crypto').randomBytes(32).toString('hex');
      await prisma.sessaoAtiva.create({
        data: {
          usuarioId: user.id,
          token,
          ip: '127.0.0.1',
          userAgent: 'Test-Agent'
        }
      });
      console.log(`  ✅ Sessão ativa criada para ${user.email}`);
    }

    // 5. Mostrar estatísticas finais
    console.log('\n📈 Estatísticas após testes:');
    console.log(`  - Tentativas de login: ${await prisma.tentativaLogin.count()}`);
    console.log(`  - Sessões ativas: ${await prisma.sessaoAtiva.count()}`);
    console.log(`  - Logs de auditoria: ${await prisma.auditoria.count()}`);

    console.log('\n✅ Sistema de auditoria e segurança funcionando corretamente!');

  } catch (error) {
    console.error('❌ Erro ao testar sistema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
