// src/app/api/auth/mfa/resend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { MFAService } from "@/lib/mfa";
import { mfaResendSchema } from "@/lib/validation";

function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || 
         req.headers.get("x-real-ip") || 
         req.headers.get("cf-connecting-ip") || 
         "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const userAgent = req.headers.get("user-agent") || undefined;
  
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = mfaResendSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }
    const { userId, tipoAcao = "LOGIN" } = parsed.data;
    const tipoAcaoMapped: "LOGIN" | "RESET" | "PRIMEIRO_ACESSO" | "DESBLOQUEIO" =
      tipoAcao === "RESET_PASSWORD" ? "RESET" : (tipoAcao as "LOGIN" | "RESET" | "PRIMEIRO_ACESSO" | "DESBLOQUEIO");

    // Buscar dados do usuário
    const userRows = await prisma.$queryRaw<Array<{
      id: number;
      email: string;
      nomeCompleto: string;
      primeiroAcesso: boolean;
      status: string;
    }>>`
      SELECT id, email, nomeCompleto, primeiroAcesso, status
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

    if (user.status !== "ATIVO") {
      return NextResponse.json(
        { error: "Conta inativa" },
        { status: 401 }
      );
    }

    // Verificar rate limiting - máximo 3 códigos por 15 minutos
  const recentAttempts = await MFAService.countRecentAttempts(userId, 15);
    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: "Muitas solicitações. Aguarde 15 minutos antes de solicitar um novo código." },
        { status: 429 }
      );
    }

    // Gerar novo código MFA
    const { code: mfaCode } = await MFAService.createMFACode({
      usuarioId: user.id,
      tipoAcao: tipoAcaoMapped,
      ip,
      userAgent
    });

    // Enviar código por email
    const { EmailService } = await import("@/lib/email");
    const emailResult = await EmailService.sendMFA({
      to: user.email,
      userName: user.nomeCompleto,
      code: mfaCode,
      expiresInMinutes: 5,
      isFirstAccess: user.primeiroAcesso
    });

    if (!emailResult.success) {
      console.error("[API] Erro ao enviar email MFA:", emailResult.error);
      // Em desenvolvimento, mostrar código no console mesmo se email falhar
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Novo código MFA para ${user.email}: ${mfaCode}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Novo código enviado com sucesso",
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Email mascarado
    });

  } catch (error) {
    console.error("[API] MFA Resend error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
