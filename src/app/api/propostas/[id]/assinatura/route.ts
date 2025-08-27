import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/server/db-temp'

const signatureSchema = z.object({
  assinaturaTipo: z.enum(['DIGITAL_DESENHADA', 'DIGITAL_NOME']),
  assinaturaNome: z.string().min(1, 'Nome da assinatura é obrigatório'),
  assinaturaImagem: z.string().optional(),
  observacoes: z.string().optional(),
  consentimento: z.boolean(),
  termosAceitos: z.boolean()
})

/**
 * API para processar assinatura digital de proposta
 * POST /api/propostas/[id]/assinatura
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propostaId = params.id
    const body = await request.json()

    // Validar dados
    const validatedData = signatureSchema.parse(body)

    if (!validatedData.consentimento) {
      return NextResponse.json(
        { error: 'Consentimento é obrigatório' },
        { status: 400 }
      )
    }

    if (!validatedData.termosAceitos) {
      return NextResponse.json(
        { error: 'Aceitação dos termos é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar se proposta existe
    const proposta = await db.proposta.findUnique({
      where: { id: propostaId }
    })

    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já está assinada
    if (proposta.assinadoEm) {
      return NextResponse.json(
        { error: 'Proposta já está assinada' },
        { status: 400 }
      )
    }

    // Obter informações de auditoria
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const clientIp = forwardedFor || realIp || 'Unknown'

    // Atualizar proposta com assinatura
    const updatedProposta = await db.proposta.update({
      where: { id: propostaId },
      data: {
  assinaturaTipo: validatedData.assinaturaTipo as unknown as string, // TipoAssinatura enum
        assinaturaNome: validatedData.assinaturaNome,
        assinaturaImagem: validatedData.assinaturaImagem,
        assinaturaIp: clientIp,
        assinaturaUserAgent: userAgent,
        assinadoEm: new Date(),
        status: 'AGUARDANDO_APROVACAO',
        observacoesAssinatura: validatedData.observacoes
      },
      include: {
        cliente: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    })

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Assinatura processada com sucesso',
      proposta: {
        id: updatedProposta.id,
        numeroProposta: updatedProposta.numeroProposta,
        status: updatedProposta.status,
        assinadoEm: updatedProposta.assinadoEm,
        assinaturaTipo: updatedProposta.assinaturaTipo,
        assinaturaNome: updatedProposta.assinaturaNome
      }
    })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: err.issues
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
