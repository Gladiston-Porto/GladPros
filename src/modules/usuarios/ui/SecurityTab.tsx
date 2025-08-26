"use client"

import { useState, useEffect, useCallback } from "react"

interface SessaoAtiva {
  id: number
  token: string
  ip: string
  userAgent: string
  criadaEm: string
  ultimaAtividade: string
}

interface TentativaLogin {
  id: string
  ip: string
  sucesso: boolean
  email?: string
  motivoFalha?: string
  criadaEm: string
}

interface SecurityTabProps {
  userId: number
}

export function SecurityTab({ userId }: SecurityTabProps) {
  const [sessoes, setSessoes] = useState<SessaoAtiva[]>([])
  const [tentativas, setTentativas] = useState<TentativaLogin[]>([])
  const [loadingSessoes, setLoadingSessoes] = useState(true)
  const [loadingTentativas, setLoadingTentativas] = useState(true)
  const [status, setStatus] = useState<{ blocked: boolean; lastSuccessfulLoginAt?: string | null } | null>(null)

  const carregarSessoes = useCallback(async () => {
    try {
      setLoadingSessoes(true)
      const response = await fetch(`/api/usuarios/${userId}/sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessoes(data.sessions || [])
      }
    } catch (error) {
      console.error("Erro ao carregar sessões:", error)
    } finally {
      setLoadingSessoes(false)
    }
  }, [userId])

  const carregarTentativas = useCallback(async () => {
    try {
      setLoadingTentativas(true)
      const response = await fetch(`/api/security/reports?type=login-attempts&userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTentativas(data.results || [])
      }
    } catch (error) {
      console.error("Erro ao carregar tentativas:", error)
    } finally {
      setLoadingTentativas(false)
    }
  }, [userId])

  const carregarStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/security`)
      if (res.ok) {
        const data = await res.json()
        setStatus({ blocked: Boolean(data.blocked), lastSuccessfulLoginAt: data.lastSuccessfulLoginAt || null })
      }
    } catch (e) {
      console.error('Erro ao carregar status de segurança:', e)
    }
  }, [userId])

  useEffect(() => {
    carregarSessoes()
    carregarTentativas()
    carregarStatus()
  }, [carregarSessoes, carregarTentativas, carregarStatus])

  const revogarSessao = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/usuarios/sessions/${sessionId}`, {
        method: "DELETE"
      })
      if (response.ok) {
        await carregarSessoes()
      }
    } catch (error) {
      console.error("Erro ao revogar sessão:", error)
    }
  }

  const revogarTodasSessoes = async () => {
    if (!confirm("Tem certeza que deseja encerrar todas as sessões ativas deste usuário?")) {
      return
    }

    try {
      const response = await fetch(`/api/usuarios/${userId}/sessions`, {
        method: "DELETE"
      })
      if (response.ok) {
        await carregarSessoes()
      }
    } catch (error) {
      console.error("Erro ao revogar todas as sessões:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sessões Ativas */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Sessões Ativas</h3>
          {sessoes.length > 0 && (
            <button
              onClick={revogarTodasSessoes}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              🚫 Revogar Todas
            </button>
          )}
        </div>

        {loadingSessoes ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2">Carregando sessões...</span>
          </div>
        ) : sessoes.length === 0 ? (
          <div className="text-gray-500 py-4">Nenhuma sessão ativa encontrada.</div>
        ) : (
          <div className="space-y-3">
            {sessoes.map((sessao) => (
              <div key={sessao.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="font-medium">Sessão Ativa</span>
                      <span className="text-xs text-gray-500">
                        Token: {sessao.token?.substring(0, 8)}...
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>IP:</strong> {sessao.ip || "Não informado"}
                      </div>
                      <div>
                        <strong>Criada em:</strong> {new Date(sessao.criadaEm).toLocaleString('pt-BR')}
                      </div>
                      <div className="col-span-2">
                        <strong>User Agent:</strong> 
                        <div className="text-xs text-gray-600 mt-1 break-all">
                          {sessao.userAgent || "Não informado"}
                        </div>
                      </div>
                      <div>
                        <strong>Última Atividade:</strong> {new Date(sessao.ultimaAtividade).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => revogarSessao(sessao.id)}
                    className="ml-4 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    🚫 Revogar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Tentativas de Login */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <h3 className="font-semibold text-lg mb-4">Tentativas de Login</h3>

        {loadingTentativas ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2">Carregando tentativas...</span>
          </div>
        ) : tentativas.length === 0 ? (
          <div className="text-gray-500 py-4">Nenhuma tentativa de login registrada.</div>
        ) : (
          <div className="space-y-2">
            {tentativas.map((t) => {
              const d = t.criadaEm ? new Date(t.criadaEm) : null;
              const when = d && !isNaN(d.getTime()) ? d.toLocaleString('pt-BR') : '-';
              return (
                <div key={t.id} className={`border-l-4 pl-4 py-2 ${t.sucesso ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${t.sucesso ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span className={`font-medium ${t.sucesso ? "text-green-700" : "text-red-700"}`}>
                        {t.sucesso ? "✅ Login bem-sucedido" : "❌ Falha no login"}
                      </span>
                      {t.email && <span className="text-sm text-gray-600">Email: {t.email}</span>}
                      {t.ip && <span className="text-sm text-gray-600">IP: {t.ip}</span>}
                      {!t.sucesso && t.motivoFalha && (
                        <span className="text-xs rounded bg-red-100 text-red-700 px-2 py-0.5">
                          Motivo: {t.motivoFalha === 'INVALID_EMAIL' ? 'Email inexistente' : t.motivoFalha === 'INVALID_PASSWORD' ? 'Senha incorreta' : t.motivoFalha}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{when}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Informações de Segurança */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <h3 className="font-semibold text-lg mb-4">Informações de Segurança</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Tentativas de Login Falharam</div>
            <div className="text-lg font-bold text-red-600">
              {tentativas.filter(t => !t.sucesso).length}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Sessões Ativas</div>
            <div className="text-lg font-bold text-green-600">
              {sessoes.length}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Último Login Bem-sucedido</div>
            <div className="text-sm font-medium">
              {(() => {
                const v = status?.lastSuccessfulLoginAt
                if (!v) return "Nenhum login registrado"
                const d = new Date(v);
                return !isNaN(d.getTime()) ? d.toLocaleString('pt-BR') : "-"
              })()}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Status da Conta</div>
            <div className={`text-sm font-medium ${status?.blocked ? "text-red-600" : "text-green-600"}`}>
              {status?.blocked ? "🔒 Bloqueada" : "🔓 Ativa"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
