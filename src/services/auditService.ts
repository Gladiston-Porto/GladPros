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
    diff?: Record<string, any>
  ) {
    try {
      const auditModel = (prisma as any)?.auditLog
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
    } catch (error) {
      console.error('Erro ao registrar audit log:', error)
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
      const auditModel = (prisma as any)?.auditLog
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
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      return []
    }
  }
}
