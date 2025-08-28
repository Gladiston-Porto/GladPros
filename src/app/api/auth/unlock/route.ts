// src/app/api/auth/unlock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { BlockingService } from "@/lib/blocking";
import { AuditLogger } from "@/lib/audit";
import { unlockSchema } from "@/lib/validation";

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  // Nunca considerar build time durante testes
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      process.env.NEXT_PHASE === 'phase-static' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production')
    )
  );
}

export async function POST(req: NextRequest) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = unlockSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos para desbloqueio" },
        { status: 400 }
      );
    }
  const { method, userId } = parsed.data as { method: 'pin' | 'security'; userId: number };

    // Verificar se usuário existe e está bloqueado
    const userRows = await prisma.$queryRaw<Array<{
      id: number;
      email: string;
      nomeCompleto: string;
      bloqueado: boolean;
    }>>`
      SELECT id, email, nomeCompleto, bloqueado
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

    if (!user.bloqueado) {
      return NextResponse.json(
        { error: "Usuário não está bloqueado" },
        { status: 400 }
      );
    }

    let unlockResult: { success: boolean; error?: string };

    // Tentar desbloqueio com método escolhido
    if (method === 'pin') {
      const { pin } = parsed.data as { method: 'pin'; userId: number; pin: string };
      if (!pin) {
        return NextResponse.json(
          { error: "PIN é obrigatório" },
          { status: 400 }
        );
      }
      unlockResult = await BlockingService.unlockWithPin(userId, pin);
    } else {
      const { answer } = parsed.data as { method: 'security'; userId: number; answer: string };
      if (!answer) {
        return NextResponse.json(
          { error: "Resposta de segurança é obrigatória" },
          { status: 400 }
        );
      }
      unlockResult = await BlockingService.unlockWithSecurityQuestion(userId, answer);
    }

    if (!unlockResult.success) {
      // Log tentativa de desbloqueio falhada
      await AuditLogger.logLogin(userId, user.email, req, false, {
        action: 'unlock_attempt',
        method,
        reason: unlockResult.error
      });

      return NextResponse.json(
        { error: unlockResult.error },
        { status: 401 }
      );
    }

    // Log desbloqueio bem-sucedido
    await AuditLogger.logLogin(userId, user.email, req, true, {
      action: 'unlock_success',
      method,
      unlockedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Conta desbloqueada com sucesso"
    });

  } catch (error) {
    console.error("[API] Unlock error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

