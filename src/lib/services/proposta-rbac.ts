// src/lib/services/proposta-rbac.ts
// RBAC masking helpers with explicit typed shapes
import type { PropostaWithRelations, PropostaEtapa, PropostaMaterial } from './proposta-pdf'

export interface UserPermissions {
  canViewInternalValues: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canViewAllPropostas: boolean;
  isAdmin: boolean;
  userId?: number;
}

export interface PropostaContext {
  isClientView: boolean; // Visualização pelo cliente (token público)
  isAfterSignature: boolean; // Após assinatura (valores devem ser mascarados)
  userPermissions: UserPermissions;
}

const MASKED_NUMBER = "***.**";

/**
 * Determina permissões do usuário baseado no contexto
 * TODO: Integrar com sistema de RBAC real
 */
export function getUserPermissions(userId?: number, isAdmin: boolean = false): UserPermissions {
  // Por enquanto, lógica simples - pode ser expandida
  return {
    canViewInternalValues: isAdmin || false, // Por padrão, apenas admins veem valores internos
    canEdit: isAdmin || false,
    canApprove: isAdmin || false,
    canViewAllPropostas: isAdmin || false,
    isAdmin,
    userId
  };
}

/**
 * Determina contexto da visualização da proposta
 */
export function getPropostaContext(
  proposta: PropostaWithRelations | unknown,
  isClientView: boolean,
  userPermissions: UserPermissions
): PropostaContext {
  const p = proposta as PropostaWithRelations | undefined
  const isAfterSignature = p?.status === 'ASSINADA' || p?.status === 'APROVADA'
  
  return {
    isClientView,
    isAfterSignature,
    userPermissions
  };
}

/**
 * Determina se um valor deve ser mascarado
 */
function shouldMaskValue(context: PropostaContext): boolean {
  // Cliente sempre tem valores mascarados após assinatura
  if (context.isClientView && context.isAfterSignature) {
    return true;
  }
  
  // Cliente nunca vê valores internos
  if (context.isClientView) {
    return false; // Durante assinatura, cliente vê valores
  }
  
  // Usuários internos: apenas mascarar se não tiver permissão
  return !context.userPermissions.canViewInternalValues;
}

/**
 * Determina se valores internos devem ser incluídos
 */
function shouldIncludeInternalValues(context: PropostaContext): boolean {
  if (context.isClientView) {
    return false; // Cliente nunca vê valores internos
  }
  
  return context.userPermissions.canViewInternalValues;
}

/**
 * Mascara um valor numérico
 */
function maskNumericValue(value: number | null | undefined): string | number | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }
  return MASKED_NUMBER;
}

/**
 * Mascara uma etapa conforme contexto
 */
function maskEtapa(etapa: PropostaEtapa, context: PropostaContext): Record<string, unknown> {
  const shouldMask = shouldMaskValue(context);

  return {
    ...etapa,
    custoMaoObraEstimado: shouldMask
      ? maskNumericValue(etapa.custoMaoObraEstimado)
      : etapa.custoMaoObraEstimado
  };
}

function maskMaterial(material: PropostaMaterial, context: PropostaContext): Record<string, unknown> {
  const shouldMask = shouldMaskValue(context);

  const total = (material.valorUnitario ?? 0) * (material.quantidade ?? 0)

  return {
    ...material,
    valorUnitario: shouldMask
      ? maskNumericValue(material.valorUnitario)
      : material.valorUnitario,
    totalItem: shouldMask
      ? maskNumericValue(total)
      : total
  };
}

/**
 * Aplica mascaramento RBAC a uma proposta completa
 */
export function applyRBACMasking(proposta: unknown, context: PropostaContext): Record<string, unknown> {
  const shouldMask = shouldMaskValue(context);
  const includeInternal = shouldIncludeInternalValues(context);

  const p = proposta as Partial<PropostaWithRelations> | undefined

  const masked: Record<string, unknown> = {
    ...(p as Record<string, unknown>),

    // Valores principais
    valorEstimado: shouldMask
      ? maskNumericValue(p?.valorEstimado as number | null | undefined)
      : (p?.valorEstimado as number | null | undefined),
    precoPropostaCliente: shouldMask
      ? maskNumericValue(p?.precoPropostaCliente as number | null | undefined)
      : (p?.precoPropostaCliente as number | null | undefined),

    // Estimativas internas - remover completamente se não tiver permissão
  internalEstimate: includeInternal ? (p?.internalEstimate as Record<string, unknown> | undefined) : undefined,

  // Observações internas
  observacoesInternas: includeInternal ? (p?.observacoesInternas as string | undefined) : undefined,

  // Campos de auditoria interna
  criadoPor: includeInternal ? (p?.criadoPor as number | undefined) : undefined,
  atualizadoPor: includeInternal ? (p?.atualizadoPor as number | undefined) : undefined,

  // Etapas com mascaramento
  etapas: p?.etapas?.map((etapa) => maskEtapa(etapa as PropostaEtapa, context)),

  // Materiais com mascaramento
  materiais: p?.materiais?.map((material) => maskMaterial(material as PropostaMaterial, context)),

    // Anexos - filtrar privados para cliente
    anexos: context.isClientView
        ? p?.anexos?.filter((anexo) => !((anexo as { privado?: boolean }).privado))
        : p?.anexos,

    // Metadados de permissão para a UI
    canViewInternalValues: context.userPermissions.canViewInternalValues,
    canEdit: context.userPermissions.canEdit,
    canApprove: context.userPermissions.canApprove,
  }

  return masked;
}

/**
 * Filtra lista de propostas por permissões do usuário
 */
export function filterPropostasByPermissions(
  propostas: PropostaWithRelations[],
  userPermissions: UserPermissions
): PropostaWithRelations[] {
  if (userPermissions.canViewAllPropostas) {
    return propostas;
  }
  
  // Filtrar apenas propostas do usuário (se implementado)
  // Por enquanto, retorna todas - implementar filtro por criador/responsável depois
  return propostas;
}

/**
 * Valida se usuário pode acessar uma proposta específica
 */
export function canAccessProposta(
  proposta: PropostaWithRelations,
  userPermissions: UserPermissions
): boolean {
  if (userPermissions.canViewAllPropostas) {
    return true;
  }
  
  // Implementar lógica específica:
  // - Criador pode ver
  // - Responsável pode ver  
  // - Proposta do cliente do usuário pode ver
  
  return true; // Por enquanto, permite acesso
}

/**
 * Valida se usuário pode editar uma proposta
 */
export function canEditProposta(
  proposta: PropostaWithRelations,
  userPermissions: UserPermissions
): boolean {
  if (!userPermissions.canEdit) {
    return false;
  }
  
  // Não pode editar se já foi assinada/aprovada
  if (['ASSINADA', 'APROVADA'].includes(proposta.status)) {
    return false;
  }
  
  return true;
}

/**
 * Valida se usuário pode aprovar uma proposta
 */
export function canApproveProposta(
  proposta: PropostaWithRelations,
  userPermissions: UserPermissions
): boolean {
  if (!userPermissions.canApprove) {
    return false;
  }
  
  // Só pode aprovar se estiver assinada
  return proposta.status === 'ASSINADA';
}
