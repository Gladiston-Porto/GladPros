import { NextRequest, NextResponse } from "next/server";
import { SecurityService } from "@/lib/security";

interface Params {
  sessionId: string;
}

// DELETE - Revogar sessão específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { sessionId } = await params;
    const id = parseInt(sessionId);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID de sessão inválido" },
        { status: 400 }
      );
    }

    await SecurityService.revokeSession(id);
    
    return NextResponse.json({ 
      message: "Sessão revogada com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao revogar sessão:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
