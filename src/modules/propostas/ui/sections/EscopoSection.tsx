'use client'

import React from 'react'
import { Section, Label, Textarea, Input } from '../ui-components'

interface EscopoInfo {
  titulo: string
  escopo: string
  resumo_executivo?: string
}

interface EscopoSectionProps {
  escopo: EscopoInfo
  onChange: (escopo: EscopoInfo) => void
  isLoading?: boolean
}

export function EscopoSection({ 
  escopo, 
  onChange, 
  isLoading = false 
}: EscopoSectionProps) {
  const handleFieldChange = (field: keyof EscopoInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({
      ...escopo,
      [field]: e.target.value
    })
  }

  return (
    <Section 
      title="Escopo do Projeto" 
      subtitle="Defina o título, resumo e descrição detalhada do trabalho a ser realizado"
    >
      <div className="grid grid-cols-1 gap-6">
        {/* Título da Proposta */}
        <div>
          <Label required>Título da Proposta</Label>
          <Input
            placeholder="Ex: Reforma Elétrica Comercial - Loja Centro"
            value={escopo.titulo || ''}
            onChange={handleFieldChange('titulo')}
            disabled={isLoading}
          />
          <p className="mt-2 text-xs text-slate-500">
            Este título aparecerá no cabeçalho da proposta
          </p>
        </div>

        {/* Resumo Executivo */}
        <div>
          <Label>Resumo Executivo</Label>
          <Textarea
            rows={3}
            placeholder="Breve resumo do projeto em 2-3 frases (aparecerá no início da proposta)"
            value={escopo.resumo_executivo || ''}
            onChange={handleFieldChange('resumo_executivo')}
            disabled={isLoading}
          />
          <p className="mt-2 text-xs text-slate-500">
            💡 Um bom resumo executivo destaca o objetivo principal e o valor para o cliente
          </p>
        </div>

        {/* Escopo Detalhado */}
        <div>
          <Label required>Descrição Detalhada do Escopo</Label>
          <Textarea
            rows={8}
            placeholder="Descreva detalhadamente o trabalho a ser realizado:

• O que será feito
• Onde será executado  
• Como será realizado
• Quais materiais e técnicas serão utilizados
• Resultados esperados

Seja específico para evitar mal-entendidos."
            value={escopo.escopo || ''}
            onChange={handleFieldChange('escopo')}
            disabled={isLoading}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              {escopo.escopo ? escopo.escopo.length : 0} caracteres
            </span>
            <span>
              Mínimo recomendado: 200 caracteres
            </span>
          </div>
        </div>
      </div>

      {/* Dicas para um bom escopo */}
      <div className="mt-6 rounded-xl bg-blue-50 p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">✅ Elementos de um escopo completo:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
          <div>
            <p className="font-medium mb-1">O que está INCLUÍDO:</p>
            <ul className="space-y-0.5">
              <li>• Serviços específicos</li>
              <li>• Materiais fornecidos</li>
              <li>• Locais de atuação</li>
              <li>• Padrões de qualidade</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">O que está EXCLUÍDO:</p>
            <ul className="space-y-0.5">
              <li>• Serviços não contemplados</li>
              <li>• Responsabilidades do cliente</li>
              <li>• Custos adicionais</li>
              <li>• Limitações técnicas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alertas de qualidade */}
      {escopo.escopo && escopo.escopo.length < 200 && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 border border-amber-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-amber-800">
              <p className="font-medium">Escopo muito resumido</p>
              <p className="mt-1">
                Considere adicionar mais detalhes para evitar mal-entendidos e garantir que todas as expectativas estejam alinhadas.
              </p>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
