import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { toggleUserStatusSchema } from "@/lib/validation";

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

export async function PATCH(
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
    const raw = await request.json().catch(() => ({}));
    const parsed = toggleUserStatusSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Body inválido" },
        { status: 400 }
      );
    }
    const { ativo } = parsed.data;

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "INVALID_ID", message: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    // Atualizar status do usuário
    await prisma.$executeRaw`
      UPDATE Usuario 
      SET status = ${ativo ? 'ATIVO' : 'INATIVO'}, 
          atualizadoEm = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({ 
      ok: true,
      message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso` 
    });
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
