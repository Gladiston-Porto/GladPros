import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined'
    ) &&
    process.env.NODE_ENV !== 'test'
  );
}

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    // Buscar logs de auditoria relacionados ao usuário
    const auditorias = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.tabela,
        a.registroId,
        a.acao,
        a.usuarioId,
        a.ip,
        a.payload,
        a.criadoEm,
        u.nomeCompleto,
        u.email
      FROM Auditoria a
      LEFT JOIN Usuario u ON a.usuarioId = u.id
      WHERE a.registroId = ${userId} AND a.tabela = 'Usuario'
         OR a.usuarioId = ${userId}
      ORDER BY a.criadoEm DESC
      LIMIT 100
    `;

    return NextResponse.json(auditorias);
  } catch (error) {
    console.error("Erro ao buscar auditoria:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
