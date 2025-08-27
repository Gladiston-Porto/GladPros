// Tipos simplificados para Propostas
// Enums baseados no schema Prisma
export enum StatusProposta {
  RASCUNHO = 'RASCUNHO',
  ENVIADA = 'ENVIADA', 
  ASSINADA = 'ASSINADA',
  APROVADA = 'APROVADA',
  CANCELADA = 'CANCELADA'
}

export enum StatusPermite {
  SIM = 'SIM',
  NAO = 'NAO'
}

export enum StatusEtapaProposta {
  PLANEJADA = 'PLANEJADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA'
}

export enum StatusMaterialProposta {
  PLANEJADO = 'PLANEJADO',
  SUBSTITUIDO = 'SUBSTITUIDO',
  REMOVIDO = 'REMOVIDO'
}

export enum AcaoPropostaLog {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SENT = 'SENT',
  SIGNED = 'SIGNED',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  ATTACH_ADDED = 'ATTACH_ADDED',
  ATTACH_REMOVED = 'ATTACH_REMOVED'
}

// Tipos básicos baseados no schema
export interface Proposta {
  id: string
  numero: string
  clienteId: string
  descricao: string
  detalhes?: string
  valorEstimado: number
  valorTotal: number
  status: StatusProposta
  permite?: StatusPermite
  quaisPermites?: string
  assinaturaData?: Date
  assinaturaCanvas?: string
  assinaturaIp?: string
  assinaturaUserAgent?: string
  responsavelNome?: string
  responsavelCargo?: string
  responsavelEmail?: string
  observacoesAprovacao?: string
  canceladoEm?: Date
  canceladoMotivo?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface Cliente {
  id: string
  tipo: 'PF' | 'PJ'
  nomeCompleto?: string
  razaoSocial?: string
  nomeFantasia?: string
  email: string
  telefone?: string
  status: string
}

export interface PropostaEtapa {
  id: string
  propostaId: string
  titulo: string
  descricao?: string
  valorEstimado: number
  ordem: number
  status: StatusEtapaProposta
  dataInicio?: Date
  dataFim?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PropostaMaterial {
  id: string
  propostaId: string
  etapaId?: string
  nome: string
  descricao?: string
  quantidade: number
  unidade: string
  valorUnitario: number
  valorTotal: number
  fornecedor?: string
  observacoes?: string
  status: StatusMaterialProposta
  createdAt: Date
  updatedAt: Date
}

export interface AnexoProposta {
  id: string
  propostaId: string
  nomeArquivo: string
  nomeOriginal: string
  tamanhoBytes: number
  mimeType: string
  caminhoArquivo: string
  createdAt: Date
}

export interface PropostaLog {
  id: string
  propostaId: string
  usuarioId: string
  acao: AcaoPropostaLog
  detalhes?: string
  ip?: string
  userAgent?: string
  createdAt: Date
}

export interface Usuario {
  id: string
  nome: string
  email: string
}

export interface Projeto {
  id: string
  nome: string
  descricao: string
  clienteId: string
  propostaId?: string
  createdAt: Date
}

// Tipos compostos para views
export interface PropostaWithRelations {
  id: string
  numero: string
  clienteId: string
  descricao: string
  detalhes?: string
  valorEstimado: number
  valorTotal: number
  status: StatusProposta
  permite?: StatusPermite
  quaisPermites?: string
  assinaturaData?: Date
  assinaturaCanvas?: string
  assinaturaIp?: string
  assinaturaUserAgent?: string
  responsavelNome?: string
  responsavelCargo?: string
  responsavelEmail?: string
  observacoesAprovacao?: string
  canceladoEm?: Date
  canceladoMotivo?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  cliente: {
    id: string
    nome: string
    email: string
  }
  etapas?: PropostaEtapa[]
  materiais?: PropostaMaterial[]
  anexos?: AnexoProposta[]
  logs?: (PropostaLog & {
    usuario: {
      id: string
      nome: string
      email: string
    }
  })[]
  projeto?: Projeto
}

export type PropostaWithDetails = PropostaWithRelations

// Form types
export interface CreatePropostaRequest {
  clienteId: string
  descricao: string
  detalhes?: string
  valorEstimado: number
  permite?: StatusPermite
  quaisPermites?: string
  etapas: CreateEtapaRequest[]
  materiais: CreateMaterialRequest[]
}

export interface UpdatePropostaRequest extends Partial<CreatePropostaRequest> {
  status?: StatusProposta
}

export interface CreateEtapaRequest {
  titulo: string
  descricao?: string
  valorEstimado: number
  ordem: number
  status?: StatusEtapaProposta
  dataInicio?: Date
  dataFim?: Date
}

export interface CreateMaterialRequest {
  nome: string
  descricao?: string
  quantidade: number
  unidade: string
  valorUnitario: number
  fornecedor?: string
  observacoes?: string
  status?: StatusMaterialProposta
}

// Filter types
export interface PropostaFilters {
  busca?: string
  status?: StatusProposta
  clienteId?: string
  dataInicio?: string
  dataFim?: string
  valorMin?: number
  valorMax?: number
}

// Pagination types
export interface PropostaPagination {
  cursor?: string
  limit?: number
}

export interface PropostaListResponse {
  propostas: PropostaWithRelations[]
  nextCursor: string | null
  hasMore: boolean
  total?: number
}

// Signature types
export interface PropostaSignature {
  canvas: string
  confirmed: boolean
  ip?: string
  userAgent?: string
  timestamp: Date
}

export interface SignatureRequest {
  propostaId: string
  signature: PropostaSignature
  responsavelNome: string
  responsavelCargo: string
  responsavelEmail?: string
}

// Approval types
export interface ApprovalRequest {
  propostaId: string
  observacoes?: string
  criarProjeto: boolean
  manterEstoque: boolean
}

// RBAC types
export interface PropostaPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canSend: boolean
  canApprove: boolean
  canViewValue: boolean
  canSignAsResponsible: boolean
}

// Constants
export const STATUS_LABELS: Record<StatusProposta, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADA: 'Enviada',
  ASSINADA: 'Assinada',
  APROVADA: 'Aprovada',
  CANCELADA: 'Cancelada'
}

export const STATUS_COLORS: Record<StatusProposta, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-800',
  ENVIADA: 'bg-blue-100 text-blue-800',
  ASSINADA: 'bg-yellow-100 text-yellow-800',
  APROVADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800'
}
