// Script para corrigir usuários existentes no banco
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const prisma = new PrismaClient();

async function fixExistingUsers() {
  try {
    console.log('=== VERIFICANDO USUÁRIOS EXISTENTES ===');
    
    // Buscar todos os usuários
    const usuarios = await prisma.$queryRaw`
      SELECT id, email, primeiroAcesso, senhaProvisoria, criadoEm 
      FROM Usuario 
      ORDER BY criadoEm DESC
    `;
    
    console.log('Usuários encontrados:', usuarios.length);
    
    for (const usuario of usuarios) {
      console.log(`\nUsuário: ${usuario.email}`);
      console.log(`- ID: ${usuario.id}`);
      console.log(`- primeiroAcesso: ${usuario.primeiroAcesso}`);
      console.log(`- senhaProvisoria: ${usuario.senhaProvisoria}`);
      console.log(`- criadoEm: ${usuario.criadoEm}`);
      
      // Se primeiroAcesso for null ou false E senhaProvisoria for null ou false
      // Assumimos que é um usuário criado antes da correção
      if (!usuario.primeiroAcesso || !usuario.senhaProvisoria) {
        console.log(`⚠️  Corrigindo usuário ${usuario.email}...`);
        
        await prisma.$executeRaw`
          UPDATE Usuario 
          SET primeiroAcesso = true, senhaProvisoria = true 
          WHERE id = ${usuario.id}
        `;
        
        console.log('✅ Usuário corrigido!');
      } else {
        console.log('✅ Usuário já está correto');
      }
    }
    
    console.log('\n=== VERIFICAÇÃO FINAL ===');
    const usuariosAtualizados = await prisma.$queryRaw`
      SELECT id, email, primeiroAcesso, senhaProvisoria 
      FROM Usuario 
      ORDER BY criadoEm DESC
    `;
    
    console.table(usuariosAtualizados);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixExistingUsers();
