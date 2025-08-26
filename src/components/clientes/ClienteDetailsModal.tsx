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
  documento?: string // Apenas se usuário tem permissão
  criadoEm: string
  atualizadoEm: string
}

export function ClienteDetailsModal({ 
  clienteId, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ClienteDetailsModalProps) {
  const [cliente, setCliente] = useState<ClienteDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch cliente details
  useEffect(() => {
    if (!isOpen || !clienteId) {
      setCliente(null)
      setError(null)
      return
    }

    const fetchClienteDetails = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/clientes/${clienteId}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Erro ao carregar cliente')
        }

        const data = await response.json()
        setCliente(data)
      } catch (err) {
        console.error('Erro ao buscar cliente:', err)
        setError(err instanceof Error ? err.message : 'Erro inesperado')
      } finally {
        setLoading(false)
      }
    }

    fetchClienteDetails()
  }, [clienteId, isOpen])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">
              Detalhes do Cliente
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-foreground dark:text-white">Erro ao carregar</h3>
                <p className="mt-2 text-gray-600">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : cliente ? (
              <div className="space-y-6">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold
                      ${cliente.tipo === 'PF' ? 'bg-blue-500' : 'bg-purple-500'}
                    `}>
                      {cliente.tipo}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground dark:text-white">
                        {cliente.tipo === 'PF' 
                          ? cliente.nomeCompleto
                          : (cliente.nomeFantasia || cliente.razaoSocial)
                        }
                      </h3>
                      <p className="text-gray-600">
                        {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </p>
                    </div>
                  </div>
                  <span className={`
                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${cliente.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Dados Principais */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground dark:text-white border-b border-gray-200 pb-2">
                      Dados Principais
                    </h4>
                    
                    {cliente.tipo === 'PJ' && cliente.razaoSocial && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Razão Social
                        </label>
                        <p className="text-foreground dark:text-white">{cliente.razaoSocial}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        E-mail
                      </label>
                      <p className="text-foreground dark:text-white">{cliente.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Telefone
                      </label>
                      <p className="text-foreground dark:text-white">{cliente.telefone}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        {cliente.tipo === 'PF' ? 'SSN/ITIN' : 'EIN'}
                      </label>
                      <div className="space-y-1">
                        <p className="text-foreground dark:text-white">{cliente.documentoMasked}</p>
                        {cliente.documento && (
                          <p className="text-sm text-blue-600 font-mono bg-blue-50 p-2 rounded">
                            Documento completo: {cliente.documento}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-foreground dark:text-white border-b border-gray-200 pb-2">
                      Endereço
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Endereço 1
                      </label>
                      <p className="text-foreground dark:text-white">{cliente.endereco1}</p>
                      {cliente.endereco2 && (
                        <>
                          <label className="block text-sm font-medium text-gray-500 mt-3 mb-1">
                            Endereço 2
                          </label>
                          <p className="text-gray-600 text-sm">{cliente.endereco2}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Cidade
                        </label>
                        <p className="text-foreground dark:text-white">{cliente.cidade}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Estado
                        </label>
                        <p className="text-foreground dark:text-white">{cliente.estado}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        CEP
                      </label>
                      <p className="text-foreground dark:text-white">{cliente.zipcode}</p>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {cliente.observacoes && (
                  <div>
                    <h4 className="text-lg font-medium text-foreground dark:text-white border-b border-gray-200 pb-2 mb-4">
                      Observações
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                      {cliente.observacoes}
                    </p>
                  </div>
                )}

                {/* Metadados */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground dark:text-white mb-3">
                    Informações do Sistema
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Criado em:</span>
                      <p className="text-foreground dark:text-white">
                        {new Date(cliente.criadoEm).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Última atualização:</span>
                      <p className="text-foreground dark:text-white">
                        {new Date(cliente.atualizadoEm).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {cliente && (
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              {onEdit && (
                <button
                  onClick={() => onEdit(cliente.id)}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Editar Cliente
                </button>
              )}
              {onDelete && cliente.ativo && (
                <button
                  onClick={() => onDelete(cliente.id)}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                >
                  Inativar Cliente
                </button>
              )}
              <div className="flex-1"></div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
