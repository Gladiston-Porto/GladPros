import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined'
    )
  );
}

/**
 * API para exportar propostas em CSV
 * POST /api/propostas/export/csv
 */
export async function POST(request: NextRequest) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

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
    // Minimal shape used by this export - avoids using `any`
    type MinimalProposta = {
      numeroProposta: string
      titulo?: string
      cliente: { nome: string }
      status?: string
      precoPropostaCliente?: number | null
      valorEstimado?: number | null
      criadoEm: Date
      validadeProposta?: Date | null
      assinadoEm?: Date | null
      contatoNome?: string | null
      contatoEmail?: string | null
      localExecucaoEndereco?: string | null
    }

    const p = prisma as unknown as { proposta: { findMany: (opts: unknown) => Promise<MinimalProposta[]> } }
    const propostas = await p.proposta.findMany({
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

    const rows = (propostas as MinimalProposta[]).map((proposta) => [
      proposta.numeroProposta,
      proposta.titulo,
      proposta.cliente.nome,
      proposta.status,
      proposta.precoPropostaCliente?.toFixed(2) || '',
      (proposta.valorEstimado ?? 0).toFixed(2),
      proposta.criadoEm.toLocaleDateString('pt-BR'),
      proposta.validadeProposta ? proposta.validadeProposta.toLocaleDateString('pt-BR') : '',
      proposta.assinadoEm ? proposta.assinadoEm.toLocaleDateString('pt-BR') : '',
      proposta.contatoNome || '',
      proposta.contatoEmail || '',
      proposta.localExecucaoEndereco || ''
    ])

    const csvContent = [headers, ...rows]
      .map((row: Array<string | number | undefined>) => row.map((field) => `"${String(field ?? '')}"`).join(','))
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
