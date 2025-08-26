// File: /src/modules/dashboard/components/Alerts.tsx

'use client'

import { useState } from 'react'

type Alerta = {
  id: number
  titulo: string
  mensagem: string
  lido: boolean
  criadoEm: string
}

const mockAlertas: Alerta[] = [
  {
    id: 1,
    titulo: 'Estoque baixo',
    mensagem: 'O item \"Fio 10mm\" atingiu o nível mínimo.',
    lido: false,
    criadoEm: '2025-06-11 08:45',
  },
  {
    id: 2,
    titulo: 'Invoice pendente',
    mensagem: 'A invoice #3021 está em atraso há 5 dias.',
    lido: false,
    criadoEm: '2025-06-10 16:30',
  },
  {
    id: 3,
    titulo: 'Reunião agendada',
    mensagem: 'Reunião com setor financeiro às 14h.',
    lido: true,
    criadoEm: '2025-06-09 11:20',
  },
]

export default function AlertsDropdown() {
  const [alertas, setAlertas] = useState<Alerta[]>(mockAlertas)

  const marcarComoLido = (id: number) => {
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, lido: true } : a))
    )
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-20">
      <div className="p-3 border-b font-medium text-gray-700">
        Notificações
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {alertas.length === 0 ? (
          <li className="p-4 text-gray-500 text-sm">Nenhuma notificação.</li>
        ) : (
          alertas.map((alerta) => (
            <li
              key={alerta.id}
              className={`px-4 py-3 border-b text-sm cursor-pointer hover:bg-gray-50 ${
                alerta.lido ? 'text-gray-400' : 'text-gray-700 font-semibold'
              }`}
              onClick={() => marcarComoLido(alerta.id)}
            >
              <div>{alerta.titulo}</div>
              <div className="text-xs">{alerta.mensagem}</div>
              <div className="text-[10px] text-gray-400 mt-1">
                {alerta.criadoEm}
              </div>
            </li>
          ))
        )}
      </ul>
      <div className="p-2 text-center text-xs text-blue-600 hover:underline cursor-pointer">
        Ver todas as notificações
      </div>
    </div>
  )
}
