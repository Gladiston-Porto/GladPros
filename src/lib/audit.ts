import { NextRequest } from 'next/server';
import { prisma } from '@/server/db';

export interface AuditEvent {
  userId?: number;
  userEmail?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  timestamp?: Date;
}

export class AuditLogger {
  static async log(event: AuditEvent): Promise<void> {
    try {
      // Log no console para desenvolvimento
      console.log(`[AUDIT] ${event.status} - ${event.action}`, {
        user: event.userEmail || `ID:${event.userId}` || 'Anonymous',
        resource: event.resource ? `${event.resource}${event.resourceId ? `:${event.resourceId}` : ''}` : undefined,
        ip: event.ip,
        details: event.details,
        timestamp: event.timestamp || new Date()
      });

      // Mapear ação para enum do Prisma
      let acaoEnum: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' = 'LOGIN';
      
      switch (event.action) {
        case 'LOGIN_ATTEMPT':
        case 'LOGIN':
          acaoEnum = 'LOGIN';
          break;
        case 'LOGOUT':
          acaoEnum = 'LOGOUT';
          break;
        case 'CREATE':
        case 'CREATE_USER':
          acaoEnum = 'CREATE';
          break;
        case 'UPDATE':
        case 'UPDATE_USER':
          acaoEnum = 'UPDATE';
          break;
        case 'DELETE':
        case 'DELETE_USER':
          acaoEnum = 'DELETE';
          break;
        default:
          acaoEnum = 'LOGIN'; // Fallback
      }

      // Salvar usando o modelo Auditoria do Prisma
      await prisma.auditoria.create({
        data: {
          tabela: event.resource || 'system',
          registroId: event.resourceId ? parseInt(event.resourceId) : 0,
          acao: acaoEnum,
          usuarioId: event.userId || null,
          ip: event.ip || null,
          payload: event.details ? JSON.stringify({
            action: event.action,
            status: event.status,
            userAgent: event.userAgent,
            ...event.details
          }) : undefined
        }
      }).catch((error) => {
        console.error('[AUDIT] Erro ao salvar no modelo Auditoria:', error);
      });

    } catch (error) {
      console.error('[AUDIT] Erro no sistema de auditoria:', error);
    }
  }

  // Helpers para extrair informações da request
  static getClientInfo(req: NextRequest) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';

    return { ip, userAgent };
  }

  // Logs específicos para diferentes ações
  static async logLogin(userId: number, email: string, req: NextRequest, success: boolean, details?: Record<string, unknown>) {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      userId,
      userEmail: email,
      action: 'LOGIN_ATTEMPT',
      details: {
        success,
        ...details
      },
      ip,
      userAgent,
      status: success ? 'SUCCESS' : 'FAILURE'
    });
  }

  static async logLogout(userId: number, email: string, req: NextRequest) {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      userId,
      userEmail: email,
      action: 'LOGOUT',
      ip,
      userAgent,
      status: 'SUCCESS'
    });
  }

  static async logMFA(userId: number, email: string, req: NextRequest, success: boolean, attempts: number) {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      userId,
      userEmail: email,
      action: 'MFA_VERIFICATION',
      details: {
        success,
        attempts,
        timestamp: new Date()
      },
      ip,
      userAgent,
      status: success ? 'SUCCESS' : 'FAILURE'
    });
  }

  static async logPasswordChange(userId: number, email: string, req: NextRequest, type: 'RESET' | 'CHANGE') {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      userId,
      userEmail: email,
      action: 'PASSWORD_CHANGE',
      details: {
        type,
        timestamp: new Date()
      },
      ip,
      userAgent,
      status: 'SUCCESS'
    });
  }

  static async logFirstAccess(userId: number, email: string, req: NextRequest) {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      userId,
      userEmail: email,
      action: 'FIRST_ACCESS_SETUP',
      details: {
        completedAt: new Date()
      },
      ip,
      userAgent,
      status: 'SUCCESS'
    });
  }

  static async logUnauthorizedAccess(req: NextRequest, resource: string) {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      action: 'UNAUTHORIZED_ACCESS',
      resource,
      details: {
        attemptedUrl: req.url,
        method: req.method
      },
      ip,
      userAgent,
      status: 'WARNING'
    });
  }

  static async logDataAccess(userId: number, email: string, req: NextRequest, resource: string, resourceId?: string) {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      userId,
      userEmail: email,
      action: 'DATA_ACCESS',
      resource,
      resourceId,
      details: {
        method: req.method,
        url: req.url
      },
      ip,
      userAgent,
      status: 'SUCCESS'
    });
  }

  static async logDataModification(userId: number, email: string, req: NextRequest, resource: string, resourceId: string, operation: 'CREATE' | 'UPDATE' | 'DELETE', changes?: Record<string, unknown>) {
    const { ip, userAgent } = this.getClientInfo(req);
    
    await this.log({
      userId,
      userEmail: email,
      action: 'DATA_MODIFICATION',
      resource,
      resourceId,
      details: {
        operation,
        changes,
        timestamp: new Date()
      },
      ip,
      userAgent,
      status: 'SUCCESS'
    });
  }

  // Buscar logs de auditoria
  static async getLogs(filters?: {
    userId?: number;
    action?: string;
    resource?: string;
    status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      // Como não temos a tabela ainda, retornar array vazio
      // Quando implementarmos a tabela, aqui fará a query
      console.log('[AUDIT] Buscando logs com filtros:', filters);
      return {
        logs: [],
        total: 0,
        hasMore: false
      };
    } catch (error) {
      console.error('[AUDIT] Erro ao buscar logs:', error);
      return {
        logs: [],
        total: 0,
        hasMore: false
      };
    }
  }
}
