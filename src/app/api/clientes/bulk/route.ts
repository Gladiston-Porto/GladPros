import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { requireClientePermission } from '@/lib/rbac'
import { clienteFiltersSchema } from '@/lib/validations/cliente'
import { ZodError, z } from 'zod'

export const runtime = 'nodejs'

const bulkSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete']),
  scope: z.enum(['selected', 'allFiltered']),
  ids: z.array(z.number().int().positive()).optional(),
  filters: clienteFiltersSchema.partial().optional()
})

function buildWhereFromFilters(filters: any) {
  const where: any = {}
  if (filters?.q && String(filters.q).trim()) {
    const q = String(filters.q).trim()
    where.OR = [
      { nomeCompleto: { contains: q, mode: 'insensitive' } },
      { razaoSocial: { contains: q, mode: 'insensitive' } },
      { nomeFantasia: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { docLast4: { contains: q } }
    ]
  }
  if (filters?.tipo && filters.tipo !== 'all') {
    where.tipo = filters.tipo
  }
  if (filters?.ativo !== undefined && filters.ativo !== 'all') {
    where.status = filters.ativo ? 'ATIVO' : 'INATIVO'
  }
  return where
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { action, scope, ids, filters } = bulkSchema.parse(body)

    // Permission per action
    if (action === 'delete') {
      await requireClientePermission(request, 'canDelete')
    } else {
      await requireClientePermission(request, 'canUpdate')
    }

    let where: any = {}
    if (scope === 'selected') {
      if (!ids || ids.length === 0) {
        return NextResponse.json({ error: 'Nenhum ID informado' }, { status: 400 })
      }
      where.id = { in: ids }
    } else {
      where = buildWhereFromFilters(filters || {})
    }

    let count = 0
    if (action === 'activate' || action === 'deactivate') {
      const res = await prisma.cliente.updateMany({
        where,
        data: { status: action === 'activate' ? 'ATIVO' : 'INATIVO' }
      })
      count = res.count
    } else if (action === 'delete') {
      const res = await prisma.cliente.deleteMany({ where })
      count = res.count
    }

    return NextResponse.json({ processed: count })
  } catch (error) {
    console.error('[API] POST /api/clientes/bulk error:', error)
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error) {
      if (error.message === 'UNAUTHENTICATED') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
