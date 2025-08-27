// src/lib/services/proposta-rbac.ts
import type { Proposta, PropostaEtapa, AnyArgs } from '@/types/prisma-temp';

export type Role = 'ADMIN' | 'USER' | 'VIEWER';
export type Permission =
  | 'VIEW_INTERNAL_VALUES'
  | 'EDIT_PROPOSTA'
  | 'APPROVE_PROPOSTA'
  | 'VIEW_ALL_PROPOSTAS';

export interface UserPermissions {
  canViewInternalValues: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canViewAllPropostas: boolean;
  isAdmin: boolean;
  userId?: number;
  role?: Role;
}

export interface PropostaContext {
  isClientView: boolean; // Visualização pelo cliente (token público)
  isAfterSignature: boolean; // Após assinatura (valores devem ser mascarados)
  userPermissions: UserPermissions;
}

const MASKED_NUMBER = '***.**' as const;

/**
 * Determina permissões do usuário baseado no contexto
 * TODO: Integrar com sistema de RBAC real
 */
export function getUserPermissions(userId?: number, isAdmin: boolean = false, role?: Role): UserPermissions {
  // Lógica conservadora: admin tem todas as permissões
  const perms = {
    canViewInternalValues: Boolean(isAdmin),
    canEdit: Boolean(isAdmin),
    canApprove: Boolean(isAdmin),
    canViewAllPropostas: Boolean(isAdmin),
    isAdmin: Boolean(isAdmin),
    userId,
    role,
  } as UserPermissions;

  return perms;
}

/**
 * Determina contexto da visualização da proposta
 */
export function getPropostaContext(
  proposta: Proposta | { status?: string } | undefined,
  isClientView: boolean,
  userPermissions: UserPermissions
): PropostaContext {
  const status = proposta?.status ?? '';
  const isAfterSignature = status === 'ASSINADA' || status === 'APROVADA';

  return {
    isClientView,
    isAfterSignature,
    userPermissions,
  };
}

/**
 * Determina se um valor deve ser mascarado
 */
function shouldMaskValue(context: PropostaContext): boolean {
  // Cliente sempre tem valores mascarados após assinatura
  if (context.isClientView && context.isAfterSignature) return true;

  // Cliente não vê valores internos normalmente
  if (context.isClientView) return false;

  // Interno: mascarar se não tiver permissão
  return !context.userPermissions.canViewInternalValues;
}

/**
 * Determina se valores internos devem ser incluídos
 */
function shouldIncludeInternalValues(context: PropostaContext): boolean {
  if (context.isClientView) return false;
  return context.userPermissions.canViewInternalValues;
}

/**
 * Mascara um valor numérico
 */
function maskNumericValue(value: number | null | undefined): number | string | null | undefined {
  if (value === null || value === undefined) return value;
  return MASKED_NUMBER;
}

/**
 * Mascara uma etapa conforme contexto
 */
function maskEtapa(etapa: Partial<PropostaEtapa> & Record<string, unknown>, context: PropostaContext): Partial<PropostaEtapa> {
  const shouldMask = shouldMaskValue(context);

  const custo = etapa.custoMaoObraEstimado as number | null | undefined;

  return {
    ...(etapa as Partial<PropostaEtapa>),
    custoMaoObraEstimado: (shouldMask ? maskNumericValue(custo) : custo) as unknown as number | null | undefined,
  };
}

/**
 * Mascara um material conforme contexto
 */
function maskMaterial(material: Record<string, unknown>, context: PropostaContext): Record<string, unknown> {
  const shouldMask = shouldMaskValue(context);

  const preco = material.precoUnitario as number | null | undefined;
  const total = material.totalItem as number | null | undefined;

  return {
    ...material,
    precoUnitario: shouldMask ? maskNumericValue(preco) : preco,
    totalItem: shouldMask ? maskNumericValue(total) : total,
  };
}

/**
 * Aplica mascaramento RBAC a uma proposta completa
 */
export function applyRBACMasking(proposta: Proposta | Record<string, unknown> | undefined, context: PropostaContext): Record<string, unknown> {
  const includeInternal = shouldIncludeInternalValues(context);

  const valorEstimado = (proposta as AnyArgs)?.valorEstimado as number | null | undefined;
  const precoCliente = (proposta as AnyArgs)?.precoPropostaCliente as number | null | undefined;

  const masked: Record<string, unknown> = {
    ...(proposta as Record<string, unknown>),
    valorEstimado: shouldMaskValue(context) ? maskNumericValue(valorEstimado) : valorEstimado,
    precoPropostaCliente: shouldMaskValue(context) ? maskNumericValue(precoCliente) : precoCliente,
    internalEstimate: includeInternal ? (proposta as AnyArgs)?.internalEstimate : undefined,
    observacoesInternas: includeInternal ? (proposta as AnyArgs)?.observacoesInternas : undefined,
    criadoPor: includeInternal ? (proposta as AnyArgs)?.criadoPor : undefined,
    atualizadoPor: includeInternal ? (proposta as AnyArgs)?.atualizadoPor : undefined,
    etapas: Array.isArray((proposta as AnyArgs)?.etapas)
      ? (((proposta as AnyArgs).etapas as unknown[]) || []).map((e) => maskEtapa(e as Record<string, unknown>, context))
      : undefined,
    materiais: Array.isArray((proposta as AnyArgs)?.materiais)
      ? (((proposta as AnyArgs).materiais as unknown[]) || []).map((m) => maskMaterial(m as Record<string, unknown>, context))
      : undefined,
    anexos: context.isClientView
      ? (((proposta as AnyArgs)?.anexos as unknown[]) || [])?.filter((a) => !((a as AnyArgs)?.privado))
      : (proposta as AnyArgs)?.anexos,
    canViewInternalValues: context.userPermissions.canViewInternalValues,
    canEdit: context.userPermissions.canEdit,
    canApprove: context.userPermissions.canApprove,
  };

  return masked;
}

/**
 * Filtra lista de propostas por permissões do usuário
 */
export function filterPropostasByPermissions(propostas: Proposta[] | AnyArgs[], userPermissions: UserPermissions): Proposta[] | AnyArgs[] {
  if (userPermissions.canViewAllPropostas) return propostas;

  // Implementar filtro por criador/responsável quando necessário
  return propostas;
}

/**
 * Valida se usuário pode acessar uma proposta específica
 */
export function canAccessProposta(proposta: Proposta | AnyArgs, userPermissions: UserPermissions): boolean {
  if (userPermissions.canViewAllPropostas) return true;

  // TODO: adicionar checagens por criador/responsável/cliente
  return true;
}

/**
 * Valida se usuário pode editar uma proposta
 */
export function canEditProposta(proposta: Proposta | { status?: string } | AnyArgs, userPermissions: UserPermissions): boolean {
  if (!userPermissions.canEdit) return false;
  const status = String((proposta as AnyArgs)?.status ?? '');
  if (['ASSINADA', 'APROVADA'].includes(status)) return false;

  return true;
}

/**
 * Valida se usuário pode aprovar uma proposta
 */
export function canApproveProposta(proposta: Proposta | { status?: string } | AnyArgs, userPermissions: UserPermissions): boolean {
  if (!userPermissions.canApprove) return false;
  const status = String((proposta as AnyArgs)?.status ?? '');
  return status === 'ASSINADA';
}
