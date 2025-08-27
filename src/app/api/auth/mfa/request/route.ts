// src/app/api/auth/mfa/request/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { MFAService } from "@/lib/mfa";
import { EmailService } from "@/lib/email";
import { mfaRequestSchema } from "@/lib/validation";

export async function POST(req: Request) {
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
