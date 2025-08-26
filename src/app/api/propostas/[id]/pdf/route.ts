import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db-temp'
import { PropostaPDFService, type PDFGenerationOptions, type RBACContext } from '@/lib/services/proposta-pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template') as 'client' | 'internal' || 'client'
    const includeValues = searchParams.get('includeValues') !== 'false'
    const includeEtapas = searchParams.get('includeEtapas') !== 'false'
    const includeMateriais = searchParams.get('includeMateriais') !== 'false'

    // Buscar proposta com relacionamentos
    const proposta = await db.proposta.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        etapas: true,
        materiais: true,
        anexos: true
      }
    })

    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Validar se a proposta pode gerar PDF
    const validation = PropostaPDFService.validateForPDF(proposta as any)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Proposta inválida para geração de PDF',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Configurar contexto RBAC (simplificado por enquanto)
    const rbacContext: RBACContext = {
      userId: 1, // TODO: Pegar do JWT/session
      userRole: 'admin', // TODO: Pegar do usuário logado
      permissions: ['propostas.view', 'propostas.export'], // TODO: Implementar sistema real
      isClientAccess: template === 'client'
    }

    // Configurar opções de PDF
    const pdfOptions: PDFGenerationOptions = {
      includeValues,
      includeEtapas,
      includeMateriais,
      includeAnexos: false, // Por segurança, não incluir anexos por padrão
      template,
      watermark: template === 'client' ? 'CONFIDENCIAL' : '',
      header: {
        empresa: 'GladPros',
        contato: 'contato@gladpros.com'
      }
    }

    // Gerar PDF
    const { buffer, filename, contentType } = await PropostaPDFService.generatePDF(
      proposta as any,
      rbacContext,
      pdfOptions
    )

    // Retornar PDF como download
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    headers.set('Cache-Control', 'no-cache')

    return new NextResponse(buffer as any, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Erro ao gerar PDF da proposta:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Permitir apenas GET para este endpoint
export async function POST() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  )
}
