import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db-temp'
import { StatusProposta } from '@/types/propostas'
import emailService from '@/lib/services/emailService'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propostaId = parseInt(params.id)

    if (isNaN(propostaId)) {
      return NextResponse.json(
        { error: 'ID da proposta inválido' },
        { status: 400 }
      )
    }

    // Find proposal
    const proposta = await db.proposta.findFirst({
      where: {
        id: propostaId,
        deletedAt: null
      },
      include: {
        cliente: true
      }
    })

    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Check if proposal can be sent
    if (proposta.status !== StatusProposta.RASCUNHO) {
      return NextResponse.json(
        { error: 'Apenas propostas em rascunho podem ser enviadas' },
        { status: 400 }
      )
    }

    // Update proposal status and send email
    const updatedProposta = await db.proposta.update({
      where: { id: propostaId },
      data: {
        status: StatusProposta.ENVIADA,
        enviadaParaOCliente: new Date()
      },
      include: {
        cliente: true
      }
    })

    // Send email to client
    const emailResult = await emailService.sendProposalSentNotification(
      updatedProposta,
      updatedProposta.cliente!.email
    )

    if (!emailResult.success) {
      // Rollback if email fails
      await db.proposta.update({
        where: { id: propostaId },
        data: {
          status: StatusProposta.RASCUNHO,
          enviadaParaOCliente: null
        }
      })

      return NextResponse.json(
        { error: 'Erro ao enviar email: ' + emailResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Proposta enviada com sucesso',
      proposta: updatedProposta
    })

  } catch (error) {
    console.error('Error sending proposal:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
