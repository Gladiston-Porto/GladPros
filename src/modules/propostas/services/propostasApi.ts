// src/modules/propostas/services/propostasApi.ts
import type { StatusProposta } from '@/types/propostas'

export interface PropostaDTO {
  id: string
  numeroProposta: string
  titulo: string
  status: StatusProposta
  precoPropostaCliente?: number
  valorEstimado: number
  criadoEm: string
  validadeProposta?: string
  assinadoEm?: string
  cliente: {
    id: string
    nome: string
    email: string
  }
  contatoNome?: string
  contatoEmail?: string
  localExecucaoEndereco?: string
}

export interface PropostasResponse {
  data: PropostaDTO[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PropostasFilters {
  q?: string
  status?: StatusProposta | 'all'
  clienteId?: string
  page?: number
  pageSize?: number
  sortKey?: 'numeroProposta' | 'titulo' | 'cliente' | 'status' | 'valor' | 'criadoEm'
  sortDir?: 'asc' | 'desc'
}

export async function getPropostas(
  filters: PropostasFilters,
  signal?: AbortSignal
): Promise<PropostasResponse> {
  // Use the main, robust /api/propostas endpoint and map its response
  const params = new URLSearchParams()
  if (filters.q) params.append('search', filters.q)
  if (filters.status && filters.status !== 'all') params.append('status', filters.status)
  if (filters.clienteId) params.append('clienteId', filters.clienteId)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
  if (filters.sortKey) params.append('sortKey', filters.sortKey as string)
  if (filters.sortDir) params.append('sortDir', filters.sortDir)

  const response = await fetch(`/api/propostas?${params.toString()}`, {
    signal,
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`)
  }

  const body = await response.json()

  // Map server shape { items, pagination } -> PropostasResponse
  const items: unknown[] = body.items || []
  // Minimal server-side shape for safe mapping (avoid using `any`)
  interface ServerProposta {
    id?: string
    numeroProposta?: string
    titulo?: string
    status?: StatusProposta
    precoPropostaCliente?: number
    valorEstimado?: number
    criadoEm?: string
    validadeProposta?: string
    assinadoEm?: string
    cliente?: {
      id?: string
      nomeCompleto?: string
      razaoSocial?: string
      email?: string
    }
    contatoNome?: string
    contatoEmail?: string
    localExecucaoEndereco?: string
  }
  const pagination = body.pagination || {}

  const data = items.map((p) => {
    const sp = p as ServerProposta
    return {
      id: sp.id || '',
      numeroProposta: sp.numeroProposta || '',
      titulo: sp.titulo || '',
      status: sp.status as StatusProposta,
      precoPropostaCliente: sp.precoPropostaCliente,
      valorEstimado: sp.valorEstimado || 0,
      criadoEm: sp.criadoEm || '',
      validadeProposta: sp.validadeProposta,
      assinadoEm: sp.assinadoEm,
      cliente: {
        id: sp.cliente?.id || '',
        nome: sp.cliente?.nomeCompleto || sp.cliente?.razaoSocial || '',
        email: sp.cliente?.email || ''
      },
      contatoNome: sp.contatoNome,
      contatoEmail: sp.contatoEmail,
      localExecucaoEndereco: sp.localExecucaoEndereco
    }
  })

  const total = typeof pagination.total === 'number' ? pagination.total : 0
  const page = filters.page || 1
  const pageSize = filters.pageSize || 10
  const totalPages = pagination.hasNext ? page + 1 : Math.ceil(total / pageSize)

  return { data, total, page, pageSize, totalPages }
}

export async function deleteProposta(id: string): Promise<void> {
  const response = await fetch(`/api/propostas/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao deletar proposta')
  }
}

export async function duplicateProposta(id: string): Promise<PropostaDTO> {
  const response = await fetch(`/api/propostas/${id}/duplicate`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao duplicar proposta')
  }

  return response.json()
}

export async function sendProposta(id: string): Promise<void> {
  const response = await fetch(`/api/propostas/${id}/send`, {
    method: 'POST',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erro ao enviar proposta')
  }
}
