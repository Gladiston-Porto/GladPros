'use client'

import React from 'react'
import { Badge, currency } from '../ui-components'
import { TotaisCalculados, InternoInfo } from '../types'
import { StatusProposta } from '@/types/prisma-temp'
import { Label, Input } from '../ui-components'

interface ResumoPrecoSidebarProps {
  totais: TotaisCalculados
  interno: InternoInfo
  status: StatusProposta
  onInternoChange: (interno: InternoInfo) => void
  onStatusChange: (status: StatusProposta) => void
}

export function ResumoPrecoSidebar({
  totais,
  interno,
  status,
  onInternoChange,
  onStatusChange
}: ResumoPrecoSidebarProps) {
  const statusBadgeColor = status === StatusProposta.PENDENTE_APROVACAO ? "orange" : 
                          status === StatusProposta.APROVADA ? "green" : "red"
  const statusLabel = status === StatusProposta.RASCUNHO ? "Rascunho" : 
                     status === StatusProposta.PENDENTE_APROVACAO ? "Aguardando" : 
                     status === StatusProposta.APROVADA ? "Aprovada" : "Cancelada"

  return (
    <div className="order-1 flex flex-col gap-6 lg:order-2">
      {/* Resumo de Preço */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-base font-semibold text-slate-800">Resumo de Preço (interno)</h3>
          <Badge>Privado</Badge>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Materiais</span>
            <span className="text-right font-medium">{currency(totais.mat)}</span>
          </div>
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Mão de obra</span>
            <span className="text-right font-medium">{currency(totais.mo)}</span>
          </div>
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Terceiros</span>
            <span className="text-right font-medium">{currency(totais.terce)}</span>
          </div>
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Frete/Logística</span>
            <span className="text-right font-medium">{currency(totais.frete)}</span>
          </div>
          <hr className="my-2" />
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Overhead</span>
            <span className="text-right font-medium">{currency(totais.overhead)}</span>
          </div>
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Margem</span>
            <span className="text-right font-medium">{currency(totais.margem)}</span>
          </div>
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Contingência</span>
            <span className="text-right font-medium">{currency(totais.conting)}</span>
          </div>
          <div className="grid grid-cols-2 text-sm">
            <span className="text-slate-500">Impostos</span>
            <span className="text-right font-medium">{currency(totais.impostos)}</span>
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Preço ao cliente (estimado)</span>
              <span className="text-base font-semibold text-slate-900">{currency(totais.precoCliente)}</span>
            </div>
          </div>
        </div>
        
        {/* Controles de cálculo */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <Label>Overhead (%)</Label>
            <Input 
              type="number" 
              value={interno.overhead_pct} 
              onChange={(e) => onInternoChange({ ...interno, overhead_pct: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Margem (%)</Label>
            <Input 
              type="number" 
              value={interno.margem_pct} 
              onChange={(e) => onInternoChange({ ...interno, margem_pct: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Impostos (%)</Label>
            <Input 
              type="number" 
              value={interno.impostos_pct} 
              onChange={(e) => onInternoChange({ ...interno, impostos_pct: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Contingência (%)</Label>
            <Input 
              type="number" 
              value={interno.contingencia_pct} 
              onChange={(e) => onInternoChange({ ...interno, contingencia_pct: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Custo materiais</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={interno.custo_material} 
              onChange={(e) => onInternoChange({ ...interno, custo_material: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Custo mão de obra</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={interno.custo_mo} 
              onChange={(e) => onInternoChange({ ...interno, custo_mo: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Horas MO</Label>
            <Input 
              type="number" 
              value={interno.horas_mo} 
              onChange={(e) => onInternoChange({ ...interno, horas_mo: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Terceiros</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={interno.custo_terceiros} 
              onChange={(e) => onInternoChange({ ...interno, custo_terceiros: Number(e.target.value) })} 
            />
          </div>
          <div>
            <Label>Frete/Log</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={interno.frete} 
              onChange={(e) => onInternoChange({ ...interno, frete: Number(e.target.value) })} 
            />
          </div>
        </div>
      </section>

      {/* Status da Proposta */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Status da Proposta</h3>
            <p className="mt-1 text-sm text-slate-500">Controle o estado atual da proposta.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              Status atual: <Badge color={statusBadgeColor}>{statusLabel}</Badge>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onStatusChange(StatusProposta.APROVADA)} 
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Marcar aprovada
              </button>
              <button 
                onClick={() => onStatusChange(StatusProposta.CANCELADA)} 
                className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
