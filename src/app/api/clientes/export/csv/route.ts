import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { clienteFiltersSchema } from '@/lib/validations/cliente'

type ClienteRow = {
  id: number | string
  tipo?: string
  nomeCompleto?: string | null
  nomeFantasia?: string | null
  razaoSocial?: string | null
  email?: string | null
  telefone?: string | null
  cidade?: string | null
  estado?: string | null
  status?: string | null
  criadoEm?: Date | string
  nomeCompletoOuRazao?: string
  ativo?: boolean
}

function buildWhere(filters: unknown) {
  // keep a flexible shape for the dynamic where object
  const where: Record<string, unknown> = {}
  const f = filters as Record<string, unknown>
  if (f?.q && String((f.q as unknown) || '').trim()) {
    const q = String(f.q).trim()
    ;(where as Record<string, unknown>).OR = [
      { nomeCompleto: { contains: q, mode: 'insensitive' } },
      { razaoSocial: { contains: q, mode: 'insensitive' } },
      { nomeFantasia: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { docLast4: { contains: q } },
    ]
  }
  if (f?.tipo && f.tipo !== 'all') (where as Record<string, unknown>)['tipo'] = f.tipo
  if (f?.ativo !== undefined && f.ativo !== 'all') (where as Record<string, unknown>)['status'] = ((f.ativo as unknown) === true) ? 'ATIVO' : 'INATIVO'
  return where
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}))
    const rawBody = raw as Record<string, unknown>
    const filename = typeof rawBody?.filename === 'string' && String(rawBody.filename).trim() ? String(rawBody.filename) : 'clientes'
  let rows: unknown[] = Array.isArray(rawBody?.clientes as unknown) ? (rawBody.clientes as unknown[]) : []

    if (!rows.length && rawBody?.filters) {
      const parsed = clienteFiltersSchema.partial().parse(rawBody.filters)
      const where = buildWhere(parsed)
      rows = await prisma.cliente.findMany({
        where,
        select: {
          id: true,
          tipo: true,
          nomeCompleto: true,
          razaoSocial: true,
          nomeFantasia: true,
          email: true,
          telefone: true,
          cidade: true,
          estado: true,
          status: true,
          criadoEm: true,
        },
        orderBy: [{ status: 'desc' }, { atualizadoEm: 'desc' }],
      })

    rows = (rows as ClienteRow[]).map((c: ClienteRow) => ({
        id: c.id,
        nomeCompletoOuRazao: c.tipo === 'PF' ? (c.nomeCompleto || '') : (c.nomeFantasia || c.razaoSocial || ''),
        tipo: c.tipo,
        email: c.email,
        telefone: c.telefone,
        cidade: c.cidade,
        estado: c.estado,
        ativo: c.status === 'ATIVO',
      criadoEm: c.criadoEm ? new Date(c.criadoEm).toISOString() : undefined,
      }))
    }

    if (!rows.length) {
      return NextResponse.json({ message: 'Nenhum cliente para exportar' }, { status: 400 })
    }

    const headers = ['ID', 'Nome/Empresa', 'Tipo', 'E-mail', 'Telefone', 'Cidade', 'Estado', 'Status', 'Criado Em']
    const lines = [
      headers.join(','),
    ... (rows as ClienteRow[]).map((c: ClienteRow) => [
        c.id,
        c.nomeCompletoOuRazao || '',
        c.tipo || '',
        c.email || '',
        c.telefone || '',
        c.cidade || '',
        c.estado || '',
        c.ativo ? 'Ativo' : 'Inativo',
      c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : '',
  ].map((f: unknown) => `"${String(f).replace(/"/g, '""')}"`).join(','))
    ]
    const csv = lines.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    })
  } catch (_e) {
    console.error('Erro ao gerar CSV de clientes:', _e)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
