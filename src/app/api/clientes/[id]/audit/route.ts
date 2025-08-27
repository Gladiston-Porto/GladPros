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
  await requireClientePermission(request, 'canUpdate')
    
    // Validar parâmetros
  const { id } = clienteParamsSchema.parse(await ctx.params)
    
    // Obter parâmetros de query
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    // Buscar histórico
    const history = await AuditService.getEntityHistory('Cliente', id, limit)
    
    // Formatar resposta
    const data = history.map((entry) => {
      const e = entry as Record<string, unknown>
      let parsedDiff: Record<string, unknown> | null = null
      try {
        parsedDiff = e.diff ? JSON.parse(String(e.diff)) : null
      } catch {
        parsedDiff = null
      }
      const usuario = e.usuario as Record<string, unknown> | undefined
      return {
        id: (e.id as number) ?? null,
        acao: (e.acao as string) ?? null,
        diff: parsedDiff,
        timestamp: e.timestamp instanceof Date ? e.timestamp.toISOString() : String(e.timestamp),
        usuario: usuario ? { id: (usuario.id as number) ?? null, nome: (usuario.nomeCompleto as string) ?? null, email: (usuario.email as string) ?? null } : null
      }
    })
    
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
