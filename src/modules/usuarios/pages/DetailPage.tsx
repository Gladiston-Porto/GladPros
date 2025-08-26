// src/modules/usuarios/pages/DetailPage.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserForm from "../components/UserForm";
import { SecurityTab } from "../components/SecurityTab";
import { getUser, updateUser } from "../services/usersApi";
import { getAuditoriaUsuario } from "../services/auditoriaApi";
import type { Usuario } from "../types";
import type { AuditoriaResponse } from "@/types/auditoria";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toaster";

export default function UserDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<Usuario | null>(null);
  const [tab, setTab] = useState<"dados" | "permissoes" | "auditoria" | "seguranca">("dados");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auditorias, setAuditorias] = useState<AuditoriaResponse[]>([]);
  const [loadingAuditoria, setLoadingAuditoria] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getUser(id)
      .then((u) => { if (alive) setUser(u); })
      .catch((e) => { if (alive) setError(e?.message || "Falha ao carregar usuário"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  // Carregar dados de auditoria quando a aba for selecionada
  useEffect(() => {
    if (tab === "auditoria" && auditorias.length === 0) {
      setLoadingAuditoria(true);
      getAuditoriaUsuario(parseInt(id))
        .then((data) => setAuditorias(data))
        .catch((e) => console.error("Erro ao carregar auditoria:", e))
        .finally(() => setLoadingAuditoria(false));
    }
  }, [tab, id, auditorias.length]);

  type ApiError = Error & { fields?: Record<string, string> };
  async function handleSubmit(data: Partial<Usuario>) {
    setSubmitting(true);
    setError(null);
    try {
      await updateUser(id, data);
  showToast({ title: "Sucesso", message: "Usuário atualizado", type: "success" });
  router.push("/usuarios");
    } catch (e: unknown) {
      const err = e as ApiError;
      // Se o erro tem campos específicos, vamos re-lançar para o UserForm capturar
      if (err?.fields) {
        throw err; // Re-lançar para que o UserForm possa capturar e mostrar os erros nos campos específicos
      }
      // Outros erros (genéricos) mostrar na página
  const msg = err?.message ?? "Erro ao atualizar usuário";
  setError(msg);
  showToast({ title: "Erro", message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-title text-xl">Editar Usuário</h2>
  <Link href="/usuarios" className="rounded-xl border px-3 py-2 text-sm">Voltar</Link>
      </div>
      {loading && (
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm opacity-70 dark:border-white/10 dark:bg-white/5">Carregando…</div>
      )}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Abas simples */}
      {user && (
      <div className="flex gap-2">
        {(["dados","permissoes","auditoria","seguranca"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-3 py-2 text-sm ${tab === t ? "bg-[#0098DA] text-white" : "border border-black/10 bg-white dark:border-white/10 dark:bg-white/5"}`}
          >
            {t === "dados" ? "Dados" : t === "permissoes" ? "Permissões" : t === "auditoria" ? "Auditoria" : "Segurança"}
          </button>
        ))}
      </div>
      )}

      {user && tab === "dados" && (
        <UserForm
          initial={{
            ...user,
            dataNascimento:
              typeof user.dataNascimento === 'string'
                ? user.dataNascimento
                : user.dataNascimento
                ? new Date(user.dataNascimento).toISOString().slice(0, 10)
                : undefined,
          }}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {tab === "permissoes" && user && (
        <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-4 dark:border-white/10 dark:bg-white/5">
          <h3 className="font-semibold text-lg">Permissões do Usuário</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <strong>Nível/Role:</strong> {user.role || "USUARIO"}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                user.role === "ADMIN" ? "bg-red-100 text-red-800" :
                user.role === "GERENTE" ? "bg-blue-100 text-blue-800" :
                user.role === "FINANCEIRO" ? "bg-green-100 text-green-800" :
                user.role === "ESTOQUE" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {user.role === "ADMIN" ? "Acesso Total" :
                 user.role === "GERENTE" ? "Gerenciamento" :
                 user.role === "FINANCEIRO" ? "Financeiro" :
                 user.role === "ESTOQUE" ? "Estoque" : "Usuário Padrão"}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({
                "Usuários": "usuarios",
                "Financeiro": "financeiro", 
                "Clientes": "clientes",
                "Projetos": "projetos",
                "Propostas": "propostas",
                "Estoque": "estoque"
              }).map(([label, module]) => {
                const userRole = user.role || "USUARIO";
                const permissions = ["read", "create", "update", "delete"];
                
                return (
                  <div key={module} className="p-3 border rounded-lg">
                    <div className="font-medium mb-2">{label}</div>
                    <div className="space-y-1 text-xs">
                      {permissions.map(action => {
                        // Verificação simplificada de permissões no client-side
                        let hasPermission = false;
                        if (userRole === "ADMIN") {
                          hasPermission = true;
                        } else if (userRole === "GERENTE") {
                          hasPermission = module !== "usuarios" || action === "read";
                        } else if (userRole === "FINANCEIRO") {
                          hasPermission = (module === "financeiro") || 
                                         (module === "clientes" && action === "read") ||
                                         (module === "propostas") || // Acesso total a propostas
                                         (module === "projetos" && action === "read"); // Leitura de projetos
                        } else if (userRole === "ESTOQUE") {
                          hasPermission = (module === "estoque") ||
                                         (module === "projetos" && action === "read") ||
                                         (module === "clientes" && action === "read"); // Leitura de clientes
                        } else {
                          // USUARIO: pode editar clientes e projetos (usuário de campo)
                          hasPermission = (module === "clientes") || // Acesso total a clientes
                                         (module === "projetos"); // Acesso total a projetos
                        }
                        
                        return (
                          <div key={action} className={`flex justify-between ${hasPermission ? 'text-green-600' : 'text-red-500'}`}>
                            <span>{action === "read" ? "Ler" : action === "create" ? "Criar" : action === "update" ? "Editar" : "Excluir"}</span>
                            <span>{hasPermission ? "✓" : "✗"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "auditoria" && (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 font-semibold">Histórico de Auditoria</div>
          
          {loadingAuditoria ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-2">Carregando...</span>
            </div>
          ) : auditorias.length === 0 ? (
            <div className="text-gray-500 py-4">Nenhum log de auditoria encontrado.</div>
          ) : (
            <div className="space-y-2">
              {auditorias.map((log) => {
                const acaoTexto = {
                  CREATE: "Criado",
                  UPDATE: "Atualizado", 
                  DELETE: "Excluído",
                  LOGIN: "Login realizado",
                  LOGOUT: "Logout realizado"
                }[log.acao] || log.acao;

                const corAcao = {
                  CREATE: "text-green-600",
                  UPDATE: "text-blue-600",
                  DELETE: "text-red-600", 
                  LOGIN: "text-purple-600",
                  LOGOUT: "text-gray-600"
                }[log.acao] || "text-gray-600";

                const iconAcao = {
                  CREATE: "✅",
                  UPDATE: "📝", 
                  DELETE: "🗑️",
                  LOGIN: "🔐",
                  LOGOUT: "📤"
                }[log.acao] || "📋";

                // Criar descrição mais amigável
                const getDescricaoAmigavel = () => {
                  if (log.acao === "CREATE") {
                    return "Usuário criado no sistema";
                  } else if (log.acao === "UPDATE") {
                    return "Dados do usuário atualizados";
                  } else if (log.acao === "LOGIN") {
                    return "Realizou login no sistema";
                  } else if (log.acao === "LOGOUT") {
                    return "Saiu do sistema";
                  } else if (log.acao === "DELETE") {
                    return "Usuário excluído do sistema";
                  }
                  return `${acaoTexto} - ${log.tabela}`;
                };

                return (
                  <div key={log.id} className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{iconAcao}</span>
                        <span className={`font-medium ${corAcao}`}>{acaoTexto}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700">{getDescricaoAmigavel()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.criadoEm).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-4">
                      {log.nomeCompleto || log.email ? (
                        <span>
                          👤 <span className="font-medium text-gray-700">{log.nomeCompleto || log.email}</span>
                        </span>
                      ) : log.usuarioId ? (
                        <span>👤 Usuário #{log.usuarioId}</span>
                      ) : (
                        <span>🤖 Sistema</span>
                      )}
                      
                      {log.ip && (
                        <span>🌐 IP: {log.ip}</span>
                      )}
                    </div>
                    
                    {log.payload && (
                      <details className="mt-3">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                          📋 Ver detalhes técnicos
                        </summary>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 overflow-x-auto border">
                          {JSON.stringify(JSON.parse(log.payload), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "seguranca" && user && (
        <SecurityTab userId={user.id} />
      )}
    </div>
  );
}
