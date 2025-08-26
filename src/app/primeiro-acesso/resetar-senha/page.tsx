"use client"

import { useState } from "react"
import FormContainer from "@/components/ui/FormContainer"
import SubmitButton from "@/components/ui/SubmitButton"
import FormError from "@/components/ui/FormError"
import apiClient from "@/lib/api/client"

export default function PrimeiroAcessoReset() {
  const [token, setToken] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSuccess(false)
    try {
      const res = await apiClient.resetPassword({ token, senha })
      if (!res.ok) throw new Error(res.error || "Falha")
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4">
      <FormContainer onSubmit={onSubmit} title="Primeiro Acesso - Redefinir senha">
        <p className="text-sm text-white/80 mb-3">Cole aqui o token recebido por e-mail e escolha uma nova senha.</p>

        <FormError message={error} />
        {success && <div className="mb-3 rounded bg-green-100 text-green-700 text-sm px-3 py-2">Senha redefinida (stub)</div>}

        <div className="mb-3">
          <label className="block text-sm mb-1">Token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} className="w-full px-3 py-2 rounded border" />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Nova senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-3 py-2 rounded border" />
        </div>

        <SubmitButton label={loading ? "Enviando…" : "Redefinir"} disabled={loading || !token || !senha} />
      </FormContainer>
    </main>
  )
}
