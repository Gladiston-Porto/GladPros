import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { toggleUserStatusSchema } from "@/lib/validation";

interface Params {
  id: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
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
