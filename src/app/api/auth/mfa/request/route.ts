// src/app/api/auth/mfa/request/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { MFAService } from "@/lib/mfa";
import { EmailService } from "@/lib/email";
import { mfaRequestSchema } from "@/lib/validation";

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined'
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
  const raw = await req.json().catch(() => ({}));
  const parsed = mfaRequestSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ code: "INVALID_BODY", message: "email obrigatório" }, { status: 400 });
  const { email } = parsed.data;

  type UserRow = { id: number; email: string; status: string; nome?: string | null; primeiroAcesso?: boolean };
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT id, email, status, nomeCompleto as nome, primeiroAcesso FROM Usuario WHERE email = ${email} LIMIT 1
  `;
  const user = rows[0];
  if (!user || user.status !== "ATIVO") {
    // evite enumerar: responda 200 mesmo assim
    return NextResponse.json({ ok: true });
  }

  const { code } = await MFAService.createMFACode({ usuarioId: user.id, tipoAcao: 'LOGIN' });
  const ttl = Number(process.env.MFA_CODE_TTL_MIN ?? 5);

  await EmailService.sendMFA({
    to: user.email,
    userName: user.nome || user.email,
    code,
    expiresInMinutes: ttl,
    isFirstAccess: Boolean(user.primeiroAcesso)
  });

  return NextResponse.json({ ok: true });
}
