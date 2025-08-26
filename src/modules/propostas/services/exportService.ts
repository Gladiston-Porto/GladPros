// src/modules/propostas/services/exportService.ts
import type { PropostaDTO } from './propostasApi'

export function exportToCSV(data: PropostaDTO[], filename: string = 'propostas'): void {
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

  const rows = data.map(proposta => [
    proposta.numeroProposta,
    proposta.titulo,
    proposta.cliente.nome,
    proposta.status,
    proposta.precoPropostaCliente?.toFixed(2) || '',
    proposta.valorEstimado.toFixed(2),
    new Date(proposta.criadoEm).toLocaleDateString('pt-BR'),
    proposta.validadeProposta ? new Date(proposta.validadeProposta).toLocaleDateString('pt-BR') : '',
    proposta.assinadoEm ? new Date(proposta.assinadoEm).toLocaleDateString('pt-BR') : '',
    proposta.contatoNome || '',
    proposta.contatoEmail || '',
    proposta.localExecucaoEndereco || ''
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export async function exportToPDF(data: PropostaDTO[], filename: string = 'propostas'): Promise<void> {
  // Simple HTML table for PDF
  const html = `
    <html>
      <head>
        <title>Relatório de Propostas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status-RASCUNHO { background-color: #f3f4f6; color: #374151; }
          .status-ENVIADA { background-color: #dbeafe; color: #1e40af; }
          .status-ASSINADA { background-color: #fef3c7; color: #d97706; }
          .status-APROVADA { background-color: #dcfce7; color: #16a34a; }
          .status-CANCELADA { background-color: #fee2e2; color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>Relatório de Propostas</h1>
        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>Total de propostas: ${data.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Título</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Valor Cliente</th>
              <th>Criado Em</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(proposta => `
              <tr>
                <td>${proposta.numeroProposta}</td>
                <td>${proposta.titulo}</td>
                <td>${proposta.cliente.nome}</td>
                <td><span class="status status-${proposta.status}">${proposta.status}</span></td>
                <td>USD ${proposta.precoPropostaCliente?.toFixed(2) || 'N/A'}</td>
                <td>${new Date(proposta.criadoEm).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  // Create and download PDF (simplified version)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `${filename}.html`
  link.click()
  
  URL.revokeObjectURL(url)
}

export async function exportToCSVServer(options: {
  filename: string
  filters: {
    q?: string
    status?: string
    clienteId?: string
  }
}): Promise<void> {
  const response = await fetch('/api/propostas/export/csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })

  if (!response.ok) {
    throw new Error('Falha ao exportar CSV')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `${options.filename}.csv`
  link.click()
  
  URL.revokeObjectURL(url)
}
