import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db-temp'
import { AcaoPropostaLog, StatusProposta } from '@/types/propostas'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/propostas/[id]/cancel - Cancel proposta
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const { motivo } = body

    // Check if proposta exists and can be cancelled
    const existingProposta = await db.proposta.findFirst({
      where: {
        id,
        deletedAt: null,
        status: {
          in: [StatusProposta.RASCUNHO, StatusProposta.ENVIADA]
        }
      }
    })

    if (!existingProposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada ou não pode ser cancelada' },
        { status: 404 }
      )
    }

    // TODO: Get user from session
    const userId = 'temp-user-id'

  const updatedProposta = await db.$transaction(async (tx) => {
      // Update status to CANCELADA
      const proposta = await tx.proposta.update({
        where: { id },
        data: {
          status: StatusProposta.CANCELADA,
          canceladoEm: new Date(),
          canceladoMotivo: motivo || 'Cancelado pelo usuário',
          updatedAt: new Date()
        }
      })

      // Create audit log
      const proposalNumber = String((proposta as unknown as Record<string, unknown>)['numero'] ?? (proposta as unknown as Record<string, unknown>)['numeroProposta'] ?? '')
      await tx.propostaLog.create({
        data: {
          propostaId: id,
          usuarioId: userId,
          acao: AcaoPropostaLog.CANCELLED,
          detalhes: `Proposta ${proposalNumber} cancelada. Motivo: ${motivo || 'Não informado'}`,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return proposta
    })

    return NextResponse.json({
      message: 'Proposta cancelada com sucesso',
      proposta: updatedProposta
    })

  } catch (error) {
    console.error('Error cancelling proposta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
