import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db-temp'
import type { TransactionClient } from '@/types/prisma-temp'
import { AcaoPropostaLog, StatusProposta } from '@/types/propostas'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/propostas/[id]/send - Send proposta
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check if proposta exists and can be sent
    const existingProposta = await db.proposta.findFirst({
      where: {
        id,
        deletedAt: null,
        status: StatusProposta.RASCUNHO
      }
    })

    if (!existingProposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada ou não pode ser enviada' },
        { status: 404 }
      )
    }

    // TODO: Get user from session
    const userId = 'temp-user-id'

  const updatedProposta = await db.$transaction(async (tx: TransactionClient) => {
      // Update status to ENVIADA
      const proposta = await tx.proposta.update({
        where: { id },
        data: {
          status: StatusProposta.ENVIADA,
          atualizadoEm: new Date()
        }
      })

      // Create audit log
      await tx.propostaLog.create({
        data: {
          propostaId: id,
          usuarioId: userId,
          acao: AcaoPropostaLog.SENT,
          detalhes: `Proposta ${proposta.numeroProposta} enviada para o cliente`,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return proposta
    })

    // TODO: Send email notification to client

    return NextResponse.json({
      message: 'Proposta enviada com sucesso',
      proposta: updatedProposta
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error sending proposta:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
