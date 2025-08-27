// src/app/api/auth/user-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { userStatusSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = userStatusSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }
    const { email } = parsed.data;

    // Buscar usuário e informações de bloqueio
    const userRows = await prisma.$queryRaw<Array<{
      id: number;
      email: string;
      nomeCompleto: string;
      bloqueado: boolean;
      pinSeguranca: string | null;
      perguntaSecreta: string | null;
    }>>`
      SELECT id, email, nomeCompleto, bloqueado, pinSeguranca, perguntaSecreta
      FROM Usuario 
      WHERE email = ${email}
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
      return NextResponse.json({
        blocked: false,
        message: "Conta não está bloqueada"
      });
    }

    return NextResponse.json({
      blocked: true,
      user: {
        id: user.id,
        email: user.email,
        nomeCompleto: user.nomeCompleto,
        requiresPinUnlock: !!user.pinSeguranca,
        requiresSecurityQuestion: !!user.perguntaSecreta,
        perguntaSecreta: user.perguntaSecreta
      }
    });

  } catch (error) {
    console.error("[API] User Status error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
