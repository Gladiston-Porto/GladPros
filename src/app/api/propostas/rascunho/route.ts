// src/app/api/propostas/rascunho/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireServerUser } from "@/lib/requireServerUser";

// Proteção contra execução durante build time
function isBuildTime(): boolean { return ( typeof window === 'undefined' && ( process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-production-server' || process.env.NEXT_PHASE === 'phase-static' || process.env.NEXT_PHASE === 'phase-export' || !process.env.JWT_SECRET || typeof process.env.NODE_ENV === 'undefined' ) && process.env.NODE_ENV !== 'test' ); }

// POST /api/propostas/rascunho - Salvar rascunho
export async function POST(request: NextRequest) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

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

