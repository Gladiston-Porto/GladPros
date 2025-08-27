// src/app/api/propostas/rascunho/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireServerUser } from "@/lib/requireServerUser";

// POST /api/propostas/rascunho - Salvar rascunho
export async function POST(request: NextRequest) {
  try {
  // Recebimento de rascunho iniciado (sem logs em consola)

    // Verificar autenticação
    const user = await requireServerUser();
    if (!user) {
      return NextResponse.json({
        error: 'UNAUTHORIZED',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }

  // Parse do body (armazenado para compatibilidade/inspeção futura)
  const body = await request.json();
  void body;
  // Para rascunhos, vamos apenas salvar no localStorage do lado do cliente
  // ou em cache temporário. Por enquanto, apenas confirmar recebimento

    // Simular salvamento bem-sucedido
    return NextResponse.json({
      success: true,
      message: 'Rascunho salvo',
      timestamp: new Date().toISOString()
    });

  } catch {
    // Retornar erro sem logar diretamente no console; registro centralizado é recomendado.
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao salvar rascunho'
    }, { status: 500 });
  }
}
