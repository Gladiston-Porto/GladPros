// src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { sha256Hex } from "@/lib/tokens";
import { resetPasswordApiSchema } from "@/lib/validation";

export async function POST(req: Request) {
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
