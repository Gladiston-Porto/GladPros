import React, { useState, useEffect, useCallback } from 'react'
import { ClienteCard } from './ClienteCard'
import { ClienteFilters } from './ClienteFilters'
import { Pagination } from './Pagination'
import { ClienteFilters as ClienteFiltersType, ClienteListResponse } from '@/types/cliente'

interface ClienteListProps {
  onViewCliente?: (id: number) => void
  onEditCliente?: (id: number) => void
  onDeleteCliente?: (id: number) => void
  onCreateCliente?: () => void
}

export function ClienteList({ 
  onViewCliente, 
  onEditCliente, 
  onDeleteCliente, 
  onCreateCliente 
}: ClienteListProps) {
  const [data, setData] = useState<ClienteListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ClienteFiltersType>({
    q: '',
    tipo: 'all',
    ativo: 'all',
    page: 1,
    pageSize: 12
  })

  // Fetch clientes data
  const fetchClientes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      
      if (filters.q) queryParams.set('q', filters.q)
      if (filters.tipo && filters.tipo !== 'all') queryParams.set('tipo', filters.tipo)
      if (filters.ativo !== 'all') queryParams.set('ativo', String(filters.ativo))
      queryParams.set('page', String(filters.page))
      queryParams.set('pageSize', String(filters.pageSize))

      const response = await fetch(`/api/clientes?${queryParams.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao carregar clientes')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Erro ao buscar clientes:', err)
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Load data on mount and when filters change
  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<ClienteFiltersType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when changing search/filters
      page: newFilters.q !== undefined || newFilters.tipo !== undefined || newFilters.ativo !== undefined ? 1 : prev.page
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      q: '',
      tipo: 'all',
      ativo: 'all',
      page: 1,
      pageSize: filters.pageSize
    })
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes do sistema</p>
        </div>
        {onCreateCliente && (
          <button
            onClick={onCreateCliente}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Cliente
          </button>
        )}
      </div>

      {/* Filters */}
      <ClienteFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {/* Content */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar clientes</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchClientes}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Loading skeletons */}
          {Array.from({ length: filters.pageSize || 12 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-foreground dark:text-white">Nenhum cliente encontrado</h3>
          <p className="mt-2 text-gray-500">
            {filters.q || filters.tipo !== 'all' || filters.ativo !== 'all'
              ? 'Tente ajustar os filtros para encontrar clientes.'
              : 'Comece criando seu primeiro cliente.'
            }
          </p>
          {onCreateCliente && (
            <button
              onClick={onCreateCliente}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Cliente
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                onView={onViewCliente}
                onEdit={onEditCliente}
                onDelete={onDeleteCliente}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </>
      )}
    </div>
  )
}
