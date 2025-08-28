import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { clienteFiltersSchema } from '@/lib/validations/cliente'

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined'
    ) &&
    process.env.NODE_ENV !== 'test'
  );
}

function buildWhere(filters: Record<string, unknown>) {
  const where: Record<string, unknown> = {}
  if (filters?.q && String(filters.q).trim()) {
    const q = String(filters.q).trim()
    where.OR = [
      { nomeCompleto: { contains: q, mode: 'insensitive' } },
      { razaoSocial: { contains: q, mode: 'insensitive' } },
      { nomeFantasia: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { docLast4: { contains: q } },
    ]
  }
  if (filters?.tipo && filters.tipo !== 'all') where.tipo = filters.tipo
  if (filters?.ativo !== undefined && filters.ativo !== 'all') where.status = filters.ativo ? 'ATIVO' : 'INATIVO'
  return where
}

export async function POST(request: NextRequest) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
    const raw = await request.json().catch(() => ({}))
    const filename = typeof raw?.filename === 'string' && raw.filename.trim() ? raw.filename : 'clientes'
    type ClienteRow = {
      id: number | string
      nomeCompletoOuRazao?: string
      tipo?: string
      email?: string
      telefone?: string
      cidade?: string
      estado?: string
      ativo?: boolean
      criadoEm?: string
    }

    // Raw shape returned by the prisma select above
    type RawCliente = {
      id: number
      tipo: string
      nomeCompleto: string | null
      razaoSocial: string | null
      nomeFantasia: string | null
      email: string
      telefone: string
      cidade: string | null
      estado: string | null
      status: string
      criadoEm: Date
    }

    let rows: ClienteRow[] = Array.isArray(raw?.clientes) ? raw.clientes as ClienteRow[] : []

    if (!rows.length && raw?.filters) {
      const parsed = clienteFiltersSchema.partial().parse(raw.filters)
      const where = buildWhere(parsed)
      const dbRows = await prisma.cliente.findMany({
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
      }) as RawCliente[]

      rows = dbRows.map((c) => ({
        id: c.id,
        nomeCompletoOuRazao: c.tipo === 'PF' ? (c.nomeCompleto || '') : (c.nomeFantasia || c.razaoSocial || ''),
        tipo: c.tipo,
        email: c.email,
        telefone: c.telefone,
        cidade: c.cidade ?? undefined,
        estado: c.estado ?? undefined,
        ativo: c.status === 'ATIVO',
        criadoEm: c.criadoEm.toISOString(),
      }))
    }

    if (!rows.length) {
      return NextResponse.json({ message: 'Nenhum cliente para exportar' }, { status: 400 })
    }

    const headers = ['ID', 'Nome/Empresa', 'Tipo', 'E-mail', 'Telefone', 'Cidade', 'Estado', 'Status', 'Criado Em']
    const lines = [
      headers.join(','),
      ...rows.map((c) => ([
        c.id,
        c.nomeCompletoOuRazao || '',
        c.tipo || '',
        c.email || '',
        c.telefone || '',
        c.cidade || '',
        c.estado || '',
        c.ativo ? 'Ativo' : 'Inativo',
        c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : '',
      ].map((f) => `"${String(f ?? '').replace(/"/g, '""')}"`).join(',')))
    ]
    const csv = lines.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    })
  } catch (e) {
    console.error('Erro ao gerar CSV de clientes:', e)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}

