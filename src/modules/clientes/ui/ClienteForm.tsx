/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from 'react'
import type { ClienteCreateInput, ClienteUpdateInput, TipoCliente, TipoDocumentoPF } from '@/types/cliente'

type FormData = ClienteCreateInput

interface ClienteFormProps {
  cliente?: Partial<FormData> & { id?: number } | null
  onSubmit: (data: ClienteCreateInput | ClienteUpdateInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ClienteForm({ cliente, onSubmit, onCancel, loading = false }: ClienteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    tipo: (cliente?.tipo as TipoCliente) || 'PF',
    nomeCompleto: (cliente?.nomeCompleto as string) || '',
    nomeFantasia: (cliente?.nomeFantasia as string) || '',
    email: (cliente?.email as string) || '',
    telefone: (cliente?.telefone as string) || '',
    tipoDocumentoPF: (cliente?.tipoDocumentoPF as TipoDocumentoPF) || 'SSN',
    ssn: (cliente?.ssn as string) || '',
    itin: (cliente?.itin as string) || '',
    ein: (cliente?.ein as string) || '',
    endereco1: (cliente?.endereco1 as string) || '',
    endereco2: (cliente?.endereco2 as string) || '',
    cidade: (cliente?.cidade as string) || '',
    estado: (cliente?.estado as string) || '',
    zipcode: (cliente?.zipcode as string) || '',
    observacoes: (cliente?.observacoes as string) || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as string]) setErrors((e) => ({ ...e, [field as string]: '' }))
  }

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    return digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }

  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    return digits.replace(/(\d{5})(\d{0,4})/, (_, a, b) => (b ? `${a}-${b}` : a))
  }

  const formatSSN = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 9)
    return d.replace(/(\d{3})(\d{0,2})(\d{0,4})/, (_, a, b, c) => [a, b && `-${b}`, c && `-${c}`].filter(Boolean).join(''))
  }
  const formatITIN = formatSSN
  const formatEIN = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 9)
    return d.replace(/(\d{2})(\d{0,7})/, (_, a, b) => (b ? `${a}-${b}` : a))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.email) e.email = 'E-mail é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'E-mail inválido'
    if (!formData.telefone) e.telefone = 'Telefone é obrigatório'
    if (formData.tipo === 'PF') {
      if (!formData.nomeCompleto) e.nomeCompleto = 'Nome completo é obrigatório'
      if (formData.tipoDocumentoPF === 'SSN' && formData.ssn) {
        if (!/^\d{3}-\d{2}-\d{4}$|^\d{9}$/.test(formData.ssn)) e.ssn = 'SSN inválido'
      }
      if (formData.tipoDocumentoPF === 'ITIN' && formData.itin) {
        if (!/^9\d{2}-\d{2}-\d{4}$|^9\d{8}$/.test(formData.itin)) e.itin = 'ITIN inválido'
      }
    } else {
      if (!formData.nomeFantasia) e.nomeFantasia = 'Nome da Empresa é obrigatório'
      if (formData.ein && !/^\d{2}-\d{7}$|^\d{9}$/.test(formData.ein)) e.ein = 'EIN inválido'
    }
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    const payload: any = { ...formData }
    // Normalize document masks to match server regex patterns
    if (payload.tipo === 'PF') {
      if (payload.tipoDocumentoPF === 'SSN' && payload.ssn) {
        payload.ssn = formatSSN(payload.ssn)
      }
      if (payload.tipoDocumentoPF === 'ITIN' && payload.itin) {
        payload.itin = formatITIN(payload.itin)
      }
    } else if (payload.tipo === 'PJ' && payload.ein) {
      payload.ein = formatEIN(payload.ein)
    }
  if (payload.tipo === 'PF') {
      payload.ein = null
      if (payload.tipoDocumentoPF === 'SSN') payload.itin = null
      if (payload.tipoDocumentoPF === 'ITIN') payload.ssn = null
      payload.nomeFantasia = null
    } else {
      payload.nomeCompleto = null
      payload.tipoDocumentoPF = null
      payload.ssn = null
      payload.itin = null
    }

    try {
      await onSubmit(payload)
    } catch (err: any) {
      // Mapear erros de validação do servidor (Zod) para campos do formulário
      const fieldErrors: Record<string, string> = {}
      // Suporte a erro.fieldErrors direto
      if (err && typeof err === 'object' && err.fieldErrors && typeof err.fieldErrors === 'object') {
        Object.assign(fieldErrors, err.fieldErrors)
      }
      // Suporte a err.details como issues do Zod
      const issues = err?.details || err?.issues
      if (Array.isArray(issues)) {
        issues.forEach((issue: any) => {
          const path = Array.isArray(issue.path) ? issue.path.join('.') : issue.path
          if (typeof path === 'string' && path) {
            fieldErrors[path] = issue.message || 'Valor inválido'
          }
        })
      }
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors)
        return
      }
      // Se não for erro de campo, apenas relançar para tratamento externo
      throw err
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Tipo de Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cliente *</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input type="radio" name="tipo" value="PF" checked={formData.tipo === 'PF'} onChange={(e) => handleInputChange('tipo', e.target.value)} className="mr-2" disabled={loading} />
            Pessoa Física
          </label>
          <label className="flex items-center">
            <input type="radio" name="tipo" value="PJ" checked={formData.tipo === 'PJ'} onChange={(e) => handleInputChange('tipo', e.target.value)} className="mr-2" disabled={loading} />
            Pessoa Jurídica
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Esquerda: Dados */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground dark:text-white">Dados Principais</h3>
          {formData.tipo === 'PF' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" value={formData.nomeCompleto || ''} onChange={(e) => handleInputChange('nomeCompleto', e.target.value)} placeholder="João da Silva" disabled={loading}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nomeCompleto ? 'border-red-300' : 'border-gray-300'}`} />
              {errors.nomeCompleto && <p className="mt-1 text-sm text-red-600">{errors.nomeCompleto}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
              <input type="text" value={formData.nomeFantasia || ''} onChange={(e) => handleInputChange('nomeFantasia', e.target.value)} placeholder="Tech Solutions Inc" disabled={loading}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nomeFantasia ? 'border-red-300' : 'border-gray-300'}`} />
              {errors.nomeFantasia && <p className="mt-1 text-sm text-red-600">{errors.nomeFantasia}</p>}
            </div>
          )}

          {/* Documentos (opcionais) */}
          {formData.tipo === 'PF' ? (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-foreground dark:text-white mb-3">Documentos (Opcional)</h4>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center"><input type="radio" name="tipoDocumentoPF" value="SSN" checked={formData.tipoDocumentoPF === 'SSN'} onChange={(e) => handleInputChange('tipoDocumentoPF', e.target.value)} className="mr-2" disabled={loading} />SSN</label>
                <label className="flex items-center"><input type="radio" name="tipoDocumentoPF" value="ITIN" checked={formData.tipoDocumentoPF === 'ITIN'} onChange={(e) => handleInputChange('tipoDocumentoPF', e.target.value)} className="mr-2" disabled={loading} />ITIN</label>
              </div>
              {formData.tipoDocumentoPF === 'SSN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSN (Opcional)</label>
                  <input type="text" value={formatSSN(formData.ssn || '')} onChange={(e) => handleInputChange('ssn', e.target.value.replace(/\D/g, ''))} placeholder="123-45-6789" maxLength={11} disabled={loading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ssn ? 'border-red-300' : 'border-gray-300'}`} />
                  {errors.ssn && <p className="mt-1 text-sm text-red-600">{errors.ssn}</p>}
                </div>
              )}
              {formData.tipoDocumentoPF === 'ITIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ITIN (Opcional)</label>
                  <input type="text" value={formatITIN(formData.itin || '')} onChange={(e) => handleInputChange('itin', e.target.value.replace(/\D/g, ''))} placeholder="9XX-XX-XXXX" maxLength={11} disabled={loading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.itin ? 'border-red-300' : 'border-gray-300'}`} />
                  {errors.itin && <p className="mt-1 text-sm text-red-600">{errors.itin}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2">
              <h4 className="text-sm font-medium text-foreground dark:text-white mb-3">Documentos (Opcional)</h4>
              <label className="block text-sm font-medium text-gray-700 mb-1">EIN (Opcional)</label>
              <input type="text" value={formatEIN(formData.ein || '')} onChange={(e) => handleInputChange('ein', e.target.value.replace(/\D/g, ''))} placeholder="12-3456789" maxLength={10} disabled={loading}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ein ? 'border-red-300' : 'border-gray-300'}`} />
              {errors.ein && <p className="mt-1 text-sm text-red-600">{errors.ein}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="email@exemplo.com" disabled={loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input type="tel" value={formatTelefone(formData.telefone)} onChange={(e) => handleInputChange('telefone', e.target.value.replace(/\D/g, ''))} placeholder="(555) 123-4567" maxLength={15} disabled={loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.telefone ? 'border-red-300' : 'border-gray-300'}`} />
            {errors.telefone && <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>}
          </div>
        </div>

        {/* Direita: Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground dark:text-white">Endereço</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço 1</label>
            <input type="text" value={formData.endereco1} onChange={(e) => handleInputChange('endereco1', e.target.value)} placeholder="123 Main Street" disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.endereco1 && <p className="mt-1 text-sm text-red-600">{errors.endereco1}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço 2</label>
            <input type="text" value={formData.endereco2 || ''} onChange={(e) => handleInputChange('endereco2', e.target.value)} placeholder="Apt 101, Suite 200, etc" disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input type="text" value={formData.cidade} onChange={(e) => handleInputChange('cidade', e.target.value)} placeholder="New York" disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.cidade && <p className="mt-1 text-sm text-red-600">{errors.cidade}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input type="text" value={formData.estado} onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase().slice(0,2))} placeholder="NY" maxLength={2} disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
            <input type="text" value={formatZipCode(formData.zipcode)} onChange={(e) => handleInputChange('zipcode', e.target.value.replace(/\D/g, ''))} placeholder="12345-6789" maxLength={10} disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.zipcode && <p className="mt-1 text-sm text-red-600">{errors.zipcode}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={formData.observacoes || ''} onChange={(e) => handleInputChange('observacoes', e.target.value)} rows={4} placeholder="Informações adicionais..." disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#0098DA] px-4 py-2 text-sm text-white hover:brightness-110 disabled:opacity-70"
        >
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden />
          )}
          <span>{loading ? 'Salvando…' : 'Salvar'}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-2xl border border-[#0098DA] px-4 py-2 text-sm text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
