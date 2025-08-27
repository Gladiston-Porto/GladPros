import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

interface Params {
  id: string;
}

// GET - Status de segurança do usuário (bloqueio e último login)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "ID de usuário inválido" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<Array<{
      id: number;
      bloqueado: number | boolean;
      bloqueadoEm: Date | null;
      ultimoLoginEm: Date | null;
    }>>`
      SELECT id, bloqueado, bloqueadoEm, ultimoLoginEm
      FROM Usuario
      WHERE id = ${userId}
      LIMIT 1
    `;

    const u = rows[0];
    if (!u) return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });

    const blocked = typeof u.bloqueado === 'boolean' ? u.bloqueado : u.bloqueado === 1;
    return NextResponse.json({
      id: u.id,
      blocked,
      blockedAt: u.bloqueadoEm ? u.bloqueadoEm.toISOString() : null,
      lastSuccessfulLoginAt: u.ultimoLoginEm ? u.ultimoLoginEm.toISOString() : null
    });
  } catch (error) {
    console.error("Erro ao buscar status de segurança do usuário:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
