import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'

/**
 * API para exportar propostas em PDF
 * POST /api/propostas/export/pdf
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
    type MinimalProposta = {
      numeroProposta: string
      titulo?: string
      cliente: { nome: string }
      status?: string
      precoPropostaCliente?: number | null
      criadoEm: Date
      validadeProposta?: Date | null
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

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Propostas</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333; 
            }
            h1 { 
              color: #2563eb; 
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            .summary { 
              background-color: #f8fafc; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #e2e8f0; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f1f5f9; 
              font-weight: bold;
              color: #1e293b;
            }
            .status { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: bold;
            }
            .status-RASCUNHO { background-color: #f3f4f6; color: #374151; }
            .status-ENVIADA { background-color: #dbeafe; color: #1e40af; }
            .status-ASSINADA { background-color: #fef3c7; color: #d97706; }
            .status-APROVADA { background-color: #dcfce7; color: #16a34a; }
            .status-CANCELADA { background-color: #fee2e2; color: #dc2626; }
            .number { text-align: right; }
            .truncate { 
              max-width: 200px; 
              overflow: hidden; 
              text-overflow: ellipsis; 
              white-space: nowrap; 
            }
          </style>
        </head>
        <body>
          <h1>Relatório de Propostas</h1>
          
          <div class="summary">
            <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p><strong>Total de propostas:</strong> ${propostas.length}</p>
            ${filters.q ? `<p><strong>Filtro de busca:</strong> ${filters.q}</p>` : ''}
            ${filters.status && filters.status !== 'all' ? `<p><strong>Status filtrado:</strong> ${filters.status}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Título</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Valor Cliente</th>
                <th>Criado Em</th>
                <th>Validade</th>
              </tr>
            </thead>
            <tbody>
              ${propostas.map((proposta) => `
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <tr>
                  <td><strong>${proposta.numeroProposta}</strong></td>
                  <td class="truncate">${proposta.titulo}</td>
                  <td>${proposta.cliente.nome}</td>
                  <td><span class="status status-${proposta.status}">${proposta.status}</span></td>
                  <td class="number">${proposta.precoPropostaCliente ? `USD ${proposta.precoPropostaCliente.toFixed(2)}` : 'N/A'}</td>
                  <td>${proposta.criadoEm.toLocaleDateString('pt-BR')}</td>
                  <td>${proposta.validadeProposta ? proposta.validadeProposta.toLocaleDateString('pt-BR') : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${propostas.length === 0 ? '<p style="text-align: center; color: #64748b; margin: 40px 0;">Nenhuma proposta encontrada com os filtros aplicados.</p>' : ''}
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.html"`,
      },
    })

  } catch (error) {
    console.error('[PDF Export] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
