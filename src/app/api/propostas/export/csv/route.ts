import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'

/**
 * API para exportar propostas em CSV
 * POST /api/propostas/export/csv
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename = 'propostas', filters = {} } = body

    // Build where clause based on filters
    const where: any = {}
    
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

    const rows = propostas.map((proposta: any) => [
      proposta.numeroProposta,
      proposta.titulo,
      proposta.cliente.nome,
      proposta.status,
      proposta.precoPropostaCliente?.toFixed(2) || '',
      proposta.valorEstimado.toFixed(2),
      proposta.criadoEm.toLocaleDateString('pt-BR'),
      proposta.validadeProposta ? proposta.validadeProposta.toLocaleDateString('pt-BR') : '',
      proposta.assinadoEm ? proposta.assinadoEm.toLocaleDateString('pt-BR') : '',
      proposta.contatoNome || '',
      proposta.contatoEmail || '',
      proposta.localExecucaoEndereco || ''
    ])

    const csvContent = [headers, ...rows]
      .map((row: any) => row.map((field: any) => `"${field}"`).join(','))
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
