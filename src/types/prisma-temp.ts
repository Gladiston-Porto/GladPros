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

export type TransactionClient = {
  proposta: {
    findUnique: (args: any) => Promise<Proposta | null>
    findFirst: (args: any) => Promise<Proposta | null>
    findMany: (args: any) => Promise<Proposta[]>
    create: (args: any) => Promise<Proposta>
    update: (args: any) => Promise<Proposta>
    updateMany: (args: any) => Promise<any>
    delete: (args: any) => Promise<Proposta>
    count: (args?: any) => Promise<number>
  }
  propostaLog: {
    create: (args: any) => Promise<PropostaLog>
    findMany: (args: any) => Promise<PropostaLog[]>
  }
  propostaEtapa: {
    create: (args: any) => Promise<PropostaEtapa>
    createMany: (args: any) => Promise<any>
    findMany: (args: any) => Promise<PropostaEtapa[]>
  }
  propostaMaterial: {
    create: (args: any) => Promise<PropostaMaterial>
    createMany: (args: any) => Promise<any>
    findMany: (args: any) => Promise<PropostaMaterial[]>
  }
  cliente: {
    findUnique: (args: any) => Promise<Cliente | null>
    findMany: (args: any) => Promise<Cliente[]>
    create: (args: any) => Promise<Cliente>
    update: (args: any) => Promise<Cliente>
    delete: (args: any) => Promise<Cliente>
    count: (args?: any) => Promise<number>
  }
  usuario: {
    findUnique: (args: any) => Promise<Usuario | null>
    findMany: (args: any) => Promise<Usuario[]>
    create: (args: any) => Promise<Usuario>
    update: (args: any) => Promise<Usuario>
    delete: (args: any) => Promise<Usuario>
    count: (args?: any) => Promise<number>
  }
}

export class PrismaClient {
  proposta: TransactionClient['proposta']
  propostaLog: TransactionClient['propostaLog'] 
  propostaEtapa: TransactionClient['propostaEtapa']
  propostaMaterial: TransactionClient['propostaMaterial']
  cliente: TransactionClient['cliente']
  usuario: TransactionClient['usuario']

  constructor(options?: PrismaClientOptions) {
    // stub implementation
    this.proposta = {} as any
    this.propostaLog = {} as any
    this.propostaEtapa = {} as any
    this.propostaMaterial = {} as any
    this.cliente = {} as any
    this.usuario = {} as any
  }

  $connect(): Promise<void> {
    return Promise.resolve()
  }

  $disconnect(): Promise<void> {
    return Promise.resolve()
  }

  $transaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return fn({} as any)
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
