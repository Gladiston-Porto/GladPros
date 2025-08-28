// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { sha256Hex } from "@/lib/tokens";
import { resetPasswordApiSchema } from "@/lib/validation";

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

export async function POST(req: Request) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const parsed = resetPasswordApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Token inválido ou senha fraca" }, { status: 400 });
  }
  const { token, senha } = parsed.data;

  const tokenHash = sha256Hex(String(token));

  // Buscar token válido
  const rows: Array<{ id: number; userId: number; expiresAt: Date; used: boolean }> = await prisma.$queryRaw`
    SELECT id, userId, expiresAt, used
    FROM PasswordResetToken
    WHERE tokenHash = ${tokenHash}
    ORDER BY createdAt DESC
    LIMIT 1
  `;

  const t = rows[0];
  if (!t) return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  if (t.used) return NextResponse.json({ error: "Token já utilizado" }, { status: 400 });
  if (new Date() > t.expiresAt) return NextResponse.json({ error: "Token expirado" }, { status: 400 });

  const senhaHash = await bcrypt.hash(String(senha), 12);

  // Atualizar senha e marcar token como usado
  await prisma.$executeRaw`
    UPDATE Usuario 
    SET senha = ${senhaHash}, atualizadoEm = NOW()
    WHERE id = ${t.userId}
  `;

  await prisma.$executeRaw`
    UPDATE PasswordResetToken SET used = TRUE WHERE id = ${t.id}
  `;

  return NextResponse.json({ ok: true });
}

