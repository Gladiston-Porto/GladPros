import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'

type PropostaRow = {
  numeroProposta?: string
  titulo?: string
  cliente?: { nome?: string }
  status?: string
  precoPropostaCliente?: number | null
  valorEstimado?: number
  criadoEm?: Date
  validadeProposta?: Date | null
  assinadoEm?: Date | null
  contatoNome?: string | null
  contatoEmail?: string | null
  localExecucaoEndereco?: string | null
}

/**
 * API para exportar propostas em CSV
 * POST /api/propostas/export/csv
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename = 'propostas', filters = {} } = body

  // Build where clause based on filters
  const where: Record<string, unknown> = {}
    
    if (filters.q) {
      where.OR = [
        { titulo: { contains: filters.q } },
        { numeroProposta: { contains: filters.q } },
        { cliente: { nome: { contains: filters.q } } }
      ]
    }
    
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status
    }
    
    if (filters.clienteId) {
      where.clienteId = filters.clienteId
    }

  // Fetch data
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const propostas = await (prisma as any).proposta.findMany({
      where,
      include: {
        cliente: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        criadoEm: 'desc'
      }
    })

    // Generate CSV
    const headers = [
      'Número',
      'Título',
      'Cliente',
      'Status',
      'Valor Cliente (USD)',
      'Valor Estimado (USD)',
      'Criado Em',
      'Validade',
      'Assinado Em',
      'Contato',
      'Email Contato',
      'Endereço Execução'
    ]

  const rows = (propostas as unknown as PropostaRow[]).map((proposta) => [
      proposta.numeroProposta,
      proposta.titulo,
      proposta.cliente?.nome || '',
      proposta.status,
      proposta.precoPropostaCliente ? proposta.precoPropostaCliente.toFixed(2) : '',
      proposta.valorEstimado?.toFixed ? proposta.valorEstimado.toFixed(2) : '',
      proposta.criadoEm ? proposta.criadoEm.toLocaleDateString('pt-BR') : '',
      proposta.validadeProposta ? proposta.validadeProposta.toLocaleDateString('pt-BR') : '',
      proposta.assinadoEm ? proposta.assinadoEm.toLocaleDateString('pt-BR') : '',
      proposta.contatoNome || '',
      proposta.contatoEmail || '',
      proposta.localExecucaoEndereco || ''
    ])

    const csvContent = [headers, ...rows]
      .map((row: unknown[]) => row.map((field: unknown) => `"${String(field)}"`).join(','))
      .join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    })

  } catch (error) {
    console.error('[CSV Export] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
