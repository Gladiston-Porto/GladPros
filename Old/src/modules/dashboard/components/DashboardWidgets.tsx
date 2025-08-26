'use client'

import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function DashboardWidgets() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Atividades Recentes */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
        <div className="space-y-4">
          {[
            { action: 'Nova proposta criada', client: 'Empresa ABC', time: '2 min atrás', status: 'new' },
            { action: 'Projeto aprovado', client: 'Tech Solutions', time: '15 min atrás', status: 'approved' },
            { action: 'Pagamento recebido', client: 'StartupXYZ', time: '1 hora atrás', status: 'paid' },
            { action: 'Reunião agendada', client: 'Corp Ltda', time: '2 horas atrás', status: 'scheduled' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.status === 'new' ? 'bg-blue-100 text-blue-600' :
                activity.status === 'approved' ? 'bg-green-100 text-green-600' :
                activity.status === 'paid' ? 'bg-purple-100 text-purple-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                {activity.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> :
                 activity.status === 'scheduled' ? <Calendar className="w-4 h-4" /> :
                 <AlertCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.client}</p>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tarefas Pendentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Pendentes</h3>
        <div className="space-y-3">
          {[
            { task: 'Revisar proposta #123', priority: 'high', deadline: 'Hoje' },
            { task: 'Ligar para cliente', priority: 'medium', deadline: 'Amanhã' },
            { task: 'Atualizar projeto', priority: 'low', deadline: 'Sexta' },
            { task: 'Enviar relatório', priority: 'medium', deadline: '2 dias' }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                item.priority === 'high' ? 'bg-red-500' :
                item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.task}</p>
                <p className="text-xs text-gray-500">{item.deadline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}