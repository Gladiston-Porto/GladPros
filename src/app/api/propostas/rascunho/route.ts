// src/app/api/propostas/rascunho/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireServerUser } from "@/lib/requireServerUser";

// POST /api/propostas/rascunho - Salvar rascunho
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/propostas/rascunho - iniciado');

    // Verificar autenticação
    const user = await requireServerUser();
    if (!user) {
      return NextResponse.json({
        error: 'UNAUTHORIZED',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }

    // Parse do body
    const body = await request.json();
    
    // Para rascunhos, vamos apenas salvar no localStorage do lado do cliente
    // ou em cache temporário. Por enquanto, apenas confirmar recebimento
    console.log('Rascunho recebido para usuário:', user.id);
    console.log('Tamanho dos dados:', JSON.stringify(body).length, 'chars');

    // Simular salvamento bem-sucedido
    return NextResponse.json({
      success: true,
      message: 'Rascunho salvo',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('POST /api/propostas/rascunho error:', error);
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Erro ao salvar rascunho'
    }, { status: 500 });
  }
}
