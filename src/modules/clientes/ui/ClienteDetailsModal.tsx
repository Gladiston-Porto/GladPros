import React, { useState, useEffect } from 'react'

interface ClienteDetailsModalProps {
  clienteId: number | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

interface ClienteDetails {
  id: number
  tipo: 'PF' | 'PJ'
  nomeCompleto?: string | null
  razaoSocial?: string | null
  nomeFantasia?: string | null
  email: string
  telefone: string
  endereco1: string
  endereco2?: string | null
  cidade: string
  estado: string
  zipcode: string
  observacoes?: string | null
  ativo: boolean
  documentoMasked: string
  documento?: string
  criadoEm: string
  atualizadoEm: string
}

export function ClienteDetailsModal({ clienteId, isOpen, onClose, onEdit, onDelete }: ClienteDetailsModalProps) {
  const [cliente, setCliente] = useState<ClienteDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !clienteId) {
      setCliente(null)
      setError(null)
      return
    }

    let cancelled = false

    const fetchCliente = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/clientes/${clienteId}`)
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json.error || 'Erro ao carregar cliente')
        }
        const data = await res.json()
        if (!cancelled) setCliente(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro inesperado')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCliente()
    return () => {
      cancelled = true
    }
  }, [isOpen, clienteId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} aria-hidden />

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">Detalhes do Cliente</h2>
            <div className="flex items-center gap-2">
              {onEdit && <button onClick={() => cliente && onEdit(cliente.id)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">Editar</button>}
              {onDelete && <button onClick={() => cliente && onDelete(cliente.id)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">Excluir</button>}
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2 text-gray-600">Carregando...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-foreground dark:text-white">Erro ao carregar</h3>
                <p className="mt-2 text-gray-600">{error}</p>
                <div className="mt-4">
                  <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Fechar</button>
                </div>
              </div>
            ) : cliente ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${cliente.tipo === 'PF' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                      {cliente.tipo}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground dark:text-white">{cliente.tipo === 'PF' ? cliente.nomeCompleto : cliente.nomeFantasia || cliente.razaoSocial}</h3>
                      <p className="text-gray-600">{cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{cliente.ativo ? 'Ativo' : 'Inativo'}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground dark:text-white border-b border-gray-200 pb-2">Dados Principais</h4>
                    {cliente.tipo === 'PJ' && cliente.razaoSocial && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Razão Social</label>
                        <p className="text-foreground dark:text-white">{cliente.razaoSocial}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">E-mail</label>
                      <p className="text-foreground dark:text-white">{cliente.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
                      <p className="text-foreground dark:text-white">{cliente.telefone}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground dark:text-white border-b border-gray-200 pb-2">Endereço</h4>
                    <div>
                      <p className="text-foreground dark:text-white">{cliente.endereco1}</p>
                      {cliente.endereco2 && <p className="text-foreground dark:text-white">{cliente.endereco2}</p>}
                      <p className="text-gray-600">{cliente.cidade} - {cliente.estado} · {cliente.zipcode}</p>
                    </div>
                  </div>
                </div>

                {cliente.observacoes && (
                  <div>
                    <h4 className="text-lg font-medium text-foreground dark:text-white">Observações</h4>
                    <p className="text-foreground dark:text-white">{cliente.observacoes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Fechar</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">Nenhum detalhe disponível.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
