"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "../../../components/ui/Toaster"
import { useConfirm } from "../../../components/ui/ConfirmDialog"
import Link from "next/link"

export default function UsuarioDetalhePage() {
  const { showToast } = useToast()
  const { confirm, Dialog } = useConfirm()
  const params = useParams() as { id: string }
  const router = useRouter()
  const id = Number(params.id)

  type UserView = {
    id: number;
    email: string;
    nome?: string | null;
    role?: string | null;
    status?: string | null;
  } | null;
  const [user, setUser] = useState<UserView>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nome, setNome] = useState("")
  const [role, setRole] = useState("USUARIO")
  const [status, setStatus] = useState("ATIVO")
  const [newPass, setNewPass] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/usuarios/${id}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = (await res.json()) as { id: number; email: string; nome?: string | null; role?: string | null; status?: string | null }
      setUser(json)
      setNome(json.nome ?? "")
  setRole(json.role ?? "USUARIO")
  setStatus(json.status ?? "ATIVO")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { if (Number.isFinite(id)) load() }, [load, id])

  async function salvar(e: React.FormEvent) {
    e.preventDefault(); setMsg(null)
  const body: { nome: string; role: string; status: string; resetPassword?: string } = { nome, role, status }
    if (newPass) body.resetPassword = newPass
    const res = await fetch(`/api/usuarios/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  const json = (await res.json().catch(() => ({} as Record<string, never>))) as { error?: string } | Record<string, never>
    if (!res.ok) {
  const errMsg = (json as { error?: string } | Record<string, never>).hasOwnProperty('error') ? (json as { error?: string }).error || "Erro ao salvar" : "Erro ao salvar";
      setMsg(errMsg);
      showToast({ title: 'Erro', message: errMsg || 'Falha ao salvar', type: 'error' })
    }
    else { setMsg("Salvo."); setNewPass(""); showToast({ title: 'Sucesso', message: 'Dados atualizados', type: 'success' }); load() }
  }

  async function desativarAtivar() {
    if (!user) return;
    const ok = await confirm({
      title: user.status === 'ATIVO' ? 'Desativar usuário' : 'Ativar usuário',
      message: `Tem certeza que deseja ${user.status === 'ATIVO' ? 'desativar' : 'ativar'} ${user.email}?`,
      confirmText: user.status === 'ATIVO' ? 'Desativar' : 'Ativar',
      tone: user.status === 'ATIVO' ? 'danger' : 'default',
    })
    if (!ok) return
    const res = await fetch(`/api/usuarios/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: user.status === 'ATIVO' ? 'INATIVO' : 'ATIVO' }) })
    if (res.ok) { showToast({ title: 'Sucesso', message: 'Status atualizado', type: 'success' }); load() }
  else { const j = (await res.json().catch(() => null)) as { error?: string } | null; showToast({ title: 'Erro', message: j?.error || 'Falha ao atualizar', type: 'error' }) }
  }

  async function remover() {
    const ok = await confirm({ title: 'Remover usuário', message: 'Tem certeza que deseja remover este usuário?', confirmText: 'Remover', tone: 'danger' })
    if (!ok) return
    const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" })
    if (res.ok) { showToast({ title: 'Removido', message: 'Usuário removido com sucesso', type: 'success' }); router.push("/usuarios") }
  else { const j = (await res.json().catch(() => null)) as { error?: string } | null; showToast({ title: 'Erro', message: j?.error || 'Falha ao remover', type: 'error' }) }
  }

  return (
    <div className="p-6 max-w-2xl">
      {loading && <div className="rounded-md border p-6">Carregando...</div>}
      {error && <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>}

      {!loading && !error && user && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white drop-shadow">Usuário #{user.id}</h1>
              <p className="text-sm text-white/80">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={desativarAtivar} className="rounded-md border px-3 py-2">{user.status === 'ATIVO' ? 'Desativar' : 'Ativar'}</button>
              <button onClick={remover} className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-red-700">Remover</button>
            </div>
          </div>

          <form className="grid grid-cols-1 gap-3" onSubmit={salvar}>
            <input className="rounded-md border border-white/20 bg-white/90 px-3 py-2 text-foreground dark:bg-gray-800 dark:text-white shadow-sm focus:border-gp-blue focus:outline-none focus:ring-2 focus:ring-gp-blue/30" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <div className="flex gap-3">
              <select className="rounded-md border border-white/20 bg-white/90 px-3 py-2 text-foreground dark:bg-gray-800 dark:text-white shadow-sm focus:border-gp-blue focus:outline-none focus:ring-2 focus:ring-gp-blue/30" value={role} onChange={(e) => setRole(e.target.value)}>
                {['ADMIN','GERENTE','USUARIO','FINANCEIRO','ESTOQUE','CLIENTE'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="rounded-md border border-white/20 bg-white/90 px-3 py-2 text-foreground dark:bg-gray-800 dark:text-white shadow-sm focus:border-gp-blue focus:outline-none focus:ring-2 focus:ring-gp-blue/30" value={status} onChange={(e) => setStatus(e.target.value)}>
                {['ATIVO','INATIVO'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="rounded-md border p-3">
              <label className="block text-sm font-medium">Resetar senha</label>
              <input className="mt-2 w-full rounded-md border border-white/20 bg-white/90 px-3 py-2 text-foreground dark:bg-gray-800 dark:text-white shadow-sm focus:border-gp-blue focus:outline-none focus:ring-2 focus:ring-gp-blue/30" type="password" placeholder="Nova senha forte" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
              <p className="mt-1 text-xs text-gp-blue/70">Mín. 9 caracteres, com maiúscula, número e símbolo.</p>
            </div>
            {msg && <p className="text-green-700">{msg}</p>}
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-gp-blue px-4 py-2 text-white">Salvar</button>
              <Link href="/usuarios" className="rounded-md border px-4 py-2">Voltar</Link>
            </div>
          </form>
        </>
      )}
      <Dialog />
    </div>
  )
}
