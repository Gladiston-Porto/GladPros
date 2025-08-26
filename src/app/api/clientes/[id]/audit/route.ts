import { NextRequest, NextResponse } from 'next/server'
import { requireClientePermission } from '@/lib/rbac'
import { clienteParamsSchema } from '@/lib/validations/cliente'
import { AuditService } from '@/services/auditService'
import { ZodError } from 'zod'

/**
 * GET /api/clientes/[id]/audit - Obter histórico de auditoria do cliente
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar permissão de leitura (ADMIN e GERENTE para auditoria)
    const user = await requireClientePermission(request, 'canUpdate')
    
    // Validar parâmetros
  const { id } = clienteParamsSchema.parse(await ctx.params)
    
    // Obter parâmetros de query
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    // Buscar histórico
    const history = await AuditService.getEntityHistory('Cliente', id, limit)
    
    // Formatar resposta
    const data = history.map((entry: any) => ({
      id: entry.id,
      acao: entry.acao,
      diff: entry.diff ? JSON.parse(entry.diff) : null,
      timestamp: entry.timestamp.toISOString(),
      usuario: {
        id: entry.usuario.id,
        nome: entry.usuario.nomeCompleto,
        email: entry.usuario.email
      }
    }))
    
    return NextResponse.json({ data })
    
  } catch (error) {
    console.error('[API] GET /api/clientes/[id]/audit error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message === 'UNAUTHENTICATED') {
        return NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        )
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Sem permissão para ver histórico de auditoria' },
          { status: 403 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
