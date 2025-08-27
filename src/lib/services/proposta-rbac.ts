// src/lib/services/proposta-rbac.ts
// Temporarily allow `any` in this helper while migrating to stricter types.
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  proposta: any,
  isClientView: boolean,
  userPermissions: UserPermissions
): PropostaContext {
  const isAfterSignature = (proposta as any)?.status === 'ASSINADA' || (proposta as any)?.status === 'APROVADA';
  
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
function maskEtapa(etapa: any, context: PropostaContext): any {
  const shouldMask = shouldMaskValue(context);
  
  return {
    ...etapa,
    custoMaoObraEstimado: shouldMask 
      ? maskNumericValue(etapa.custoMaoObraEstimado as any)
      : etapa.custoMaoObraEstimado
  };
}

/**
 * Mascara um material conforme contexto
 */
function maskMaterial(material: any, context: PropostaContext): any {
  const shouldMask = shouldMaskValue(context);
  
  return {
    ...material,
    precoUnitario: shouldMask 
      ? maskNumericValue(material.precoUnitario as any)
      : material.precoUnitario,
    totalItem: shouldMask 
      ? maskNumericValue(material.totalItem as any)
      : material.totalItem
  };
}

/**
 * Aplica mascaramento RBAC a uma proposta completa
 */
export function applyRBACMasking(proposta: any, context: PropostaContext): any {
  const shouldMask = shouldMaskValue(context);
  const includeInternal = shouldIncludeInternalValues(context);
  
  const masked = {
    ...proposta,
    
    // Valores principais
    valorEstimado: shouldMask 
      ? maskNumericValue(proposta.valorEstimado)
      : proposta.valorEstimado,
    precoPropostaCliente: shouldMask 
      ? maskNumericValue(proposta.precoPropostaCliente)
      : proposta.precoPropostaCliente,
    
    // Estimativas internas - remover completamente se não tiver permissão
    internalEstimate: includeInternal ? proposta.internalEstimate : undefined,
    
    // Observações internas
    observacoesInternas: includeInternal ? proposta.observacoesInternas : undefined,
    
    // Campos de auditoria interna
    criadoPor: includeInternal ? proposta.criadoPor : undefined,
    atualizadoPor: includeInternal ? proposta.atualizadoPor : undefined,
    
    // Etapas com mascaramento
    etapas: proposta.etapas?.map((etapa: any) => maskEtapa(etapa, context)),
    
    // Materiais com mascaramento  
    materiais: proposta.materiais?.map((material: any) => maskMaterial(material, context)),
    
    // Anexos - filtrar privados para cliente
    anexos: context.isClientView 
      ? proposta.anexos?.filter((anexo: any) => !anexo.privado)
      : proposta.anexos,
    
    // Metadados de permissão para a UI
    canViewInternalValues: context.userPermissions.canViewInternalValues,
    canEdit: context.userPermissions.canEdit,
    canApprove: context.userPermissions.canApprove,
  };
  
  return masked;
}

/**
 * Filtra lista de propostas por permissões do usuário
 */
export function filterPropostasByPermissions(
  propostas: any[],
  userPermissions: UserPermissions
): any[] {
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
  proposta: any,
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
  proposta: any,
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
  proposta: any,
  userPermissions: UserPermissions
): boolean {
  if (!userPermissions.canApprove) {
    return false;
  }
  
  // Só pode aprovar se estiver assinada
  return proposta.status === 'ASSINADA';
}
