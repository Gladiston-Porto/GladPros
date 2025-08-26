import { NextRequest, NextResponse } from "next/server";
import { SecurityService } from "@/lib/security";

interface Params {
  id: string;
}

// GET - Listar sessões ativas do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "ID de usuário inválido" },
        { status: 400 }
      );
    }

  const sessions = await SecurityService.getUserSessions(userId);
  return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Revogar todas as sessões do usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "ID de usuário inválido" },
        { status: 400 }
      );
    }

    await SecurityService.revokeAllUserSessions(userId);
    
    return NextResponse.json({ 
      message: "Todas as sessões foram revogadas com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao revogar sessões:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
