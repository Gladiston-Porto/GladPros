import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/server/db-temp'
import { StatusProposta } from '@/types/propostas'
import { validateTokenPublico } from '@/lib/services/proposta-token'
import emailService from '@/lib/services/emailService'
import { assinaturaClienteSchema } from '@/lib/validations/proposta'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    const body = await request.json()
    
    // Validate request body
    const { 
      assinaturaTipo,
      assinaturaCliente,
      assinaturaImagem,
      aceiteTermos: _aceiteTermos, // eslint-disable-line @typescript-eslint/no-unused-vars
      ip,
      userAgent
    } = assinaturaClienteSchema.parse(body)

    // Validate token and find proposal
    const proposta = await validateTokenPublico(token)

    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada ou token expirado' },
        { status: 404 }
      )
    }

    if (proposta.status !== StatusProposta.ENVIADA) {
      return NextResponse.json(
        { error: 'Proposta não está disponível para assinatura' },
        { status: 400 }
      )
    }

    // Get client IP if not provided
    const clientIp = ip || request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 'unknown'
    const clientUserAgent = userAgent || request.headers.get('user-agent') || 'unknown'

    // Update proposal with signature
    const updatedProposta = await db.proposta.update({
      where: { id: proposta.id },
      data: {
        status: StatusProposta.ASSINADA,
        assinaturaTipo,
        assinadoEm: new Date(),
        assinaturaCliente,
        assinaturaImagem: assinaturaTipo === 'CANVAS' ? assinaturaImagem : null,
        assinaturaIp: clientIp,
        assinaturaUserAgent: clientUserAgent,
        updatedAt: new Date()
      }
    })

    // Log the action
    await db.propostaLog.create({
      data: {
        propostaId: proposta.id,
        actorId: null, // System user for client signatures
        action: 'SIGNED',
        newJson: {
          assinaturaTipo,
          assinaturaCliente,
          status: 'ASSINADA' 
        },
        ip: clientIp,
        userAgent: clientUserAgent,
        createdAt: new Date()
      }
    })

    // Send email notification
    try {
      await emailService.sendProposalSignedNotification(updatedProposta, assinaturaCliente)
    } catch (emailError) {
      console.error('Error sending email notification:', emailError)
      // Don't fail the main operation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Proposta assinada com sucesso',
      proposta: {
        id: updatedProposta.id,
        numeroProposta: updatedProposta.numeroProposta,
        status: updatedProposta.status,
        assinadaEm: updatedProposta.assinadoEm
      }
    })

  } catch (error) {
    console.error('Error signing proposal:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map((issue) => String(issue.message))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
