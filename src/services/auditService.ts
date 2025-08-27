import { prisma } from '@/server/db'

/**
 * Service para operações de auditoria
 */
export class AuditService {
  static async logAction(
    userId: number,
    entidade: string,
    entidadeId: number | string,
    acao: string,
    diff?: Record<string, unknown>
  ) {
    try {
      const auditModel = (prisma as unknown as { auditLog?: { create?: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>; findMany?: (args: { where: Record<string, unknown> }) => Promise<Record<string, unknown>[]> } })?.auditLog
      if (!auditModel || typeof auditModel.create !== 'function') {
        // Tabela/modelo de auditoria não disponível: não falhar
        return null
      }
      const auditLog = await auditModel.create({
        data: {
          userId,
          entidade,
          entidadeId: entidadeId.toString(),
          acao,
          diff: diff ? JSON.stringify(diff) : null,
          timestamp: new Date()
        }
      })
      return auditLog
    } catch {
      console.error('Erro ao registrar audit log:')
      // Não falha a operação principal se o log der erro
      return null
    }
  }

  static async getEntityHistory(
    entidade: string,
    entidadeId: number | string,
    limit: number = 50
  ) {
    try {
      const auditModel = (prisma as unknown as { auditLog?: { findMany?: (args: { where: Record<string, unknown>; include?: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }) => Promise<Record<string, unknown>[]> } })?.auditLog
      if (!auditModel || typeof auditModel.findMany !== 'function') {
        return []
      }
      const history = await auditModel.findMany({
        where: {
          entidade,
          entidadeId: entidadeId.toString()
        },
        include: {
          usuario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: limit
      })
      return history
    } catch {
      console.error('Erro ao buscar histórico:')
      return []
    }
  }
}
