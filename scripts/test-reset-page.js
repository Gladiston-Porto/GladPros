// Script para testar a página de reset de senha localmente
// Gera um token válido e abre a página correspondente

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('node:crypto');

function generateToken(lengthBytes = 32) {
  return crypto.randomBytes(lengthBytes).toString("hex");
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Buscar o primeiro usuário ativo
    const user = await prisma.usuario.findFirst({
      where: { status: 'ATIVO' },
      select: { id: true, email: true }
    });
    
    if (!user) {
      console.log('❌ Nenhum usuário ativo encontrado. Execute o seed primeiro.');
      return;
    }
    
    // Gerar token de reset
    const rawToken = generateToken(32);
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    
    // Inserir token no banco
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });
    
    const resetUrl = `http://localhost:3000/reset-senha/${rawToken}`;
    
    console.log('✅ Token de reset criado com sucesso!');
    console.log(`📧 Usuário: ${user.email}`);
    console.log(`🔗 URL de reset: ${resetUrl}`);
    console.log('\n🚀 Copie e cole a URL no navegador para testar a página de reset.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
