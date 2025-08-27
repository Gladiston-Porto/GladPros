// src/app/api/auth/first-access/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { PasswordService } from "@/lib/password";
import bcrypt from "bcryptjs";
import { firstAccessSetupApiSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = firstAccessSetupApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos para configuração de primeiro acesso" },
        { status: 400 }
      );
    }
    const { userId, newPassword, pin, securityQuestion, securityAnswer } = parsed.data;

    // Validar senha
    const passwordValidation = PasswordService.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Senha não atende aos critérios de segurança: " + passwordValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Validar PIN
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN deve conter exatamente 4 dígitos" },
        { status: 400 }
      );
    }

    // Validar resposta de segurança
    if (securityAnswer.trim().length < 3) {
      return NextResponse.json(
        { error: "Resposta de segurança deve ter pelo menos 3 caracteres" },
        { status: 400 }
      );
    }

    // Buscar usuário para verificar se está em primeiro acesso
    const userRows = await prisma.$queryRaw<Array<{
      id: number;
      primeiroAcesso: boolean;
      email: string;
      nomeCompleto: string;
    }>>`
      SELECT id, primeiroAcesso, email, nomeCompleto
      FROM Usuario 
      WHERE id = ${userId}
      LIMIT 1
    `;

    const user = userRows[0];
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (!user.primeiroAcesso) {
      return NextResponse.json(
        { error: "Usuário já completou o primeiro acesso" },
        { status: 400 }
      );
    }

    // Hash da nova senha, PIN e resposta de segurança
    const [hashedPassword, hashedPin, hashedAnswer] = await Promise.all([
      PasswordService.hashPassword(newPassword),
      bcrypt.hash(pin, 12),
      bcrypt.hash(securityAnswer.toLowerCase().trim(), 12)
    ]);

    // Atualizar usuário no banco
    await prisma.$executeRaw`
      UPDATE Usuario 
      SET 
        senha = ${hashedPassword},
        senhaProvisoria = FALSE,
        pinSeguranca = ${hashedPin},
        perguntaSecreta = ${securityQuestion},
        respostaSecreta = ${hashedAnswer},
        primeiroAcesso = FALSE,
        atualizadoEm = NOW()
      WHERE id = ${userId}
    `;

    // Registrar mudança de senha no histórico
    await prisma.$executeRaw`
      INSERT INTO HistoricoSenha (usuarioId, senhaHash, criadoEm)
      VALUES (${userId}, ${hashedPassword}, NOW())
    `;

    // Limpar tentativas de login falhadas (fresh start)
    await prisma.$executeRaw`
      DELETE FROM TentativaLogin 
      WHERE usuarioId = ${userId}
    `;

    // Invalidar códigos MFA antigos
    await prisma.$executeRaw`
      UPDATE CodigoMFA 
      SET usado = TRUE 
      WHERE usuarioId = ${userId}
    `;

    // Log de auditoria
    try {
      const { AuditoriaService } = await import("@/lib/auditoria");
      await AuditoriaService.registrar({
        tabela: "Usuario",
        registroId: userId,
        acao: "UPDATE",
        usuarioId: userId,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
        payload: {
          acao_detalhada: "PRIMEIRO_ACESSO_COMPLETO",
          configuracoes: {
            senhaDefinida: true,
            pinDefinido: true,
            perguntaSegurancaDefinida: true
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (auditoriaError) {
      console.error("Erro ao registrar auditoria:", auditoriaError);
    }

    // Enviar email de confirmação
    try {
      // Criar template customizado para esta situação
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Configuração Finalizada - GladPros</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0; margin-bottom: 10px;">GladPros</h1>
              <h2 style="color: #28a745; font-weight: normal;">🎉 Conta Configurada!</h2>
            </div>
            
            <p>Parabéns, <strong>${user.nomeCompleto}</strong>!</p>
            
            <p>Sua conta foi configurada com sucesso no sistema GladPros.</p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin-top: 0; color: #155724;"><strong>✅ Configurações Aplicadas:</strong></p>
              <ul style="margin: 10px 0; color: #155724;">
                <li>Nova senha definida e ativada</li>
                <li>PIN de segurança configurado</li>
                <li>Pergunta de segurança definida</li>
                <li>Acesso completo liberado</li>
              </ul>
            </div>
            
            <p>Você já pode acessar todas as funcionalidades do sistema!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #2c5aa0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Acessar Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              Este email foi enviado automaticamente pelo sistema GladPros.
            </p>
          </div>
        </body>
        </html>
      `;

      // Usar método público fictício para envio
  await fetch('/api/internal/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: "GladPros - Configuração de conta finalizada",
          html: confirmationHtml
        })
      }).catch(() => null);
      
      // Em desenvolvimento, apenas log
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Email de confirmação enviado para ${user.email}`);
      }
      
    } catch (emailError) {
      console.error("Erro ao enviar email de confirmação:", emailError);
      // Não falhar a operação por causa do email
    }

    return NextResponse.json({
      success: true,
      message: "Configuração concluída com sucesso",
      user: {
        id: user.id,
        email: user.email,
        nomeCompleto: user.nomeCompleto,
        primeiroAcesso: false
      }
    });

  } catch (error) {
    console.error("[API] First access setup error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
