// File: /src/modules/dashboard/hooks/useDashboardData.ts

'use client'

import { useEffect, useState } from 'react'

// Tipo dos dados retornados para os cards
export type DashboardData = {
  totalClientes: number
  totalPropostas: number
  totalProjetos: number
  faturamentoMensal: number
  itensEmBaixa: number
}

export function useDashboardData() {
  const [dados, setDados] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simula delay de chamada à API
    const timer = setTimeout(() => {
      // Substituir no futuro por chamada real à API
      setDados({
        totalClientes: 128,
        totalPropostas: 72,
        totalProjetos: 38,
        faturamentoMensal: 45321,
        itensEmBaixa: 5,
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return { dados, loading }
}
