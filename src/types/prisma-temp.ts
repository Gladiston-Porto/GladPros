// Tipos temporários do Prisma até resolver o problema de geração
// Este arquivo substitui as importações do @prisma/client temporariamente

export interface Proposta {
  id: number
  numeroProposta: string
  titulo?: string | null
  descricao?: string | null
  status: StatusProposta
  valorEstimado: number
  dataVencimento?: Date | null
  tokenAcesso?: string | null
  tokenPublico?: string | null
  tokenExpiresAt?: Date | null
  assinadoEm?: Date | null
  assinaturaTipo?: string | null
  assinaturaNome?: string | null
  assinaturaImagem?: string | null
  criadoEm: Date
  createdAt: Date
  atualizadoEm: Date
  clienteId: number
  usuarioId?: number | null
  // relacionamentos
  cliente?: Cliente
  usuario?: Usuario
  etapas?: PropostaEtapa[]
  materiais?: PropostaMaterial[]
  anexos?: AnexoProposta[]
  logs?: PropostaLog[]
}

export interface PropostaEtapa {
  id: number
  propostaId: number
  servico: string
  descricao: string
  status: StatusEtapaProposta
  ordem: number
  quantidade?: number | null
  unidade?: string | null
  duracaoEstimadaHoras?: number | null
  custoMaoObraEstimado?: number | null
  dependencias?: string | null
  criadoEm: Date
  atualizadoEm: Date
}

export interface PropostaMaterial {
  id: number
  propostaId: number
  nome: string
  codigo?: string | null
  quantidade: number
  unidade?: string | null
  valorUnitario?: number | null
  precoUnitario?: number | null
  status: StatusMaterialProposta
  moeda: string
  observacao?: string | null
  fornecedorPreferencial?: string | null
  criadoEm: Date
  atualizadoEm: Date
}

export interface AnexoProposta {
  id: number
  propostaId: number
  nome: string
  caminho: string
  tamanho: number
  tipo: string
  criadoEm: Date
}

export interface PropostaLog {
  id: number
  propostaId: number
  acao: string
  detalhes?: string | null
  criadoEm: Date
  usuarioId?: number | null
  usuario?: Usuario
}

export interface Cliente {
  id: number
  nomeCompleto?: string | null
  razaoSocial?: string | null
  email: string
  telefone?: string | null
  nomeFantasia?: string | null
  tipo: string
  endereco1?: string | null
  endereco2?: string | null
  cidade?: string | null
  estado?: string | null
  zipcode?: string | null
  status: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface Usuario {
  id: number
  email: string
  nomeCompleto?: string | null
  status: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface Projeto {
  id: number
  nome: string
  descricao?: string | null
  clienteId: number
  status: string
  criadoEm: Date
  atualizadoEm: Date
}

export enum StatusProposta {
  RASCUNHO = 'RASCUNHO',
  PENDENTE_APROVACAO = 'PENDENTE_APROVACAO', 
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
  CANCELADA = 'CANCELADA',
  ENVIADA = 'ENVIADA',
  ASSINADA = 'ASSINADA'
}

export enum StatusPermite {
  NECESSARIO = 'NECESSARIO',
  NAO_NECESSARIO = 'NAO_NECESSARIO',
  OBTIDO = 'OBTIDO'
}

export enum StatusEtapaProposta {
  PLANEJADA = 'PLANEJADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO', 
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA'
}

export enum StatusMaterialProposta {
  PLANEJADO = 'PLANEJADO',
  PEDIDO = 'PEDIDO',
  ENTREGUE = 'ENTREGUE',
  SUBSTITUIDO = 'SUBSTITUIDO',
  REMOVIDO = 'REMOVIDO'
}

// Tipos do Prisma Client
export interface PrismaClientOptions {
  // configurações do cliente
}

export interface DefaultArgs {
  // argumentos padrão
}
// Evita uso explícito de `any` no arquivo temporário.
// Preferimos um tipo genérico seguro que aceita um objeto de dados.
export type AnyArgs = Record<string, unknown>

export type TransactionClient = {
  proposta: {
  findUnique: (args: AnyArgs) => Promise<Proposta | null>
  findFirst: (args: AnyArgs) => Promise<Proposta | null>
  findMany: (args: AnyArgs) => Promise<Proposta[]>
  create: (args: AnyArgs) => Promise<Proposta>
  update: (args: AnyArgs) => Promise<Proposta>
  updateMany: (args: AnyArgs) => Promise<unknown>
  delete: (args: AnyArgs) => Promise<Proposta>
  count: (args?: AnyArgs) => Promise<number>
  }
  propostaLog: {
  create: (args: AnyArgs) => Promise<PropostaLog>
  findMany: (args: AnyArgs) => Promise<PropostaLog[]>
  }
  propostaEtapa: {
  create: (args: AnyArgs) => Promise<PropostaEtapa>
  createMany: (args: AnyArgs) => Promise<unknown>
  findMany: (args: AnyArgs) => Promise<PropostaEtapa[]>
  }
  propostaMaterial: {
  create: (args: AnyArgs) => Promise<PropostaMaterial>
  createMany: (args: AnyArgs) => Promise<unknown>
  findMany: (args: AnyArgs) => Promise<PropostaMaterial[]>
  }
  cliente: {
  findUnique: (args: AnyArgs) => Promise<Cliente | null>
  findMany: (args: AnyArgs) => Promise<Cliente[]>
  create: (args: AnyArgs) => Promise<Cliente>
  update: (args: AnyArgs) => Promise<Cliente>
  delete: (args: AnyArgs) => Promise<Cliente>
  count: (args?: AnyArgs) => Promise<number>
  }
  usuario: {
  findUnique: (args: AnyArgs) => Promise<Usuario | null>
  findMany: (args: AnyArgs) => Promise<Usuario[]>
  create: (args: AnyArgs) => Promise<Usuario>
  update: (args: AnyArgs) => Promise<Usuario>
  delete: (args: AnyArgs) => Promise<Usuario>
  count: (args?: AnyArgs) => Promise<number>
  }
}

export class PrismaClient {
  proposta: TransactionClient['proposta']
  propostaLog: TransactionClient['propostaLog'] 
  propostaEtapa: TransactionClient['propostaEtapa']
  propostaMaterial: TransactionClient['propostaMaterial']
  cliente: TransactionClient['cliente']
  usuario: TransactionClient['usuario']

  constructor(_options?: PrismaClientOptions) {
    // stub implementation
  // usamos um cast seguro para os stubs agora que removemos `any` do arquivo
  this.proposta = {} as unknown as TransactionClient['proposta']
  this.propostaLog = {} as unknown as TransactionClient['propostaLog']
  this.propostaEtapa = {} as unknown as TransactionClient['propostaEtapa']
  this.propostaMaterial = {} as unknown as TransactionClient['propostaMaterial']
  this.cliente = {} as unknown as TransactionClient['cliente']
  this.usuario = {} as unknown as TransactionClient['usuario']
  }

  $connect(): Promise<void> {
    return Promise.resolve()
  }

  $disconnect(): Promise<void> {
    return Promise.resolve()
  }

  $transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
  return fn({} as unknown as TransactionClient)
  }

  // Método adicional para geração de número
  generatePropostaNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return Promise.resolve(`PROP-${year}${month}${day}-${random}`)
  }
}
