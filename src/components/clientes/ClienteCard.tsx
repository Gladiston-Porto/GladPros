import React from 'react'
import { TipoCliente } from '@/types/cliente'

interface ClienteCardProps {
  cliente: {
    id: number
    tipo: TipoCliente
    nomeCompletoOuRazao: string
    email: string
    telefone: string
    cidade: string | null
    estado: string | null
    documentoMasked: string
    ativo: boolean
    criadoEm: string
    atualizadoEm: string
  }
  onView?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function ClienteCard({ cliente, onView, onEdit, onDelete }: ClienteCardProps) {
  const handleView = () => onView?.(cliente.id)
  const handleEdit = () => onEdit?.(cliente.id)
  const handleDelete = () => onDelete?.(cliente.id)

  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200
      hover:shadow-md hover:border-blue-200
      ${!cliente.ativo ? 'opacity-60 bg-gray-50' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
            ${cliente.tipo === 'PF' ? 'bg-blue-500' : 'bg-purple-500'}
          `}>
            {cliente.tipo}
          </div>
          <div>
            <h3 className="font-semibold text-foreground dark:text-white text-lg leading-tight">
              {cliente.nomeCompletoOuRazao}
            </h3>
            <p className="text-sm text-gray-500">
              {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${cliente.ativo 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
          }
        `}>
          {cliente.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{cliente.email}</span>
        </div>
        
        {cliente.telefone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{cliente.telefone}</span>
          </div>
        )}
        
        {(cliente.cidade || cliente.estado) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{[cliente.cidade, cliente.estado].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Document Info */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{cliente.documentoMasked}</span>
        <span className="mx-1">•</span>
        <span>Criado {new Date(cliente.criadoEm).toLocaleDateString('pt-BR')}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        {onView && (
          <button
            onClick={handleView}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            Ver Detalhes
          </button>
        )}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            Editar
          </button>
        )}
        {onDelete && cliente.ativo && (
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Inativar
          </button>
        )}
      </div>
    </div>
  )
}
