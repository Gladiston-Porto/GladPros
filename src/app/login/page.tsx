"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import AuthInput from "@/components/ui/AuthInput"
import AuthPassword from "@/components/ui/AuthPassword"
import apiClient from "@/lib/api/client"

type LoginBlockedData = {
  blocked: boolean
  unlockAt?: string
  requiresPinUnlock?: boolean
  requiresSecurityQuestion?: boolean
}

type LoginMfaData = {
  mfaRequired: boolean
  user: { id: number; email: string; nomeCompleto?: string; primeiroAcesso?: boolean }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

function isBlockedData(v: unknown): v is LoginBlockedData {
  return (
    isRecord(v) &&
    "blocked" in v &&
    typeof (v as Record<string, unknown>).blocked === "boolean" &&
    Boolean((v as Record<string, unknown>).blocked)
  )
}

function isMfaData(v: unknown): v is LoginMfaData {
  if (!isRecord(v)) return false
  const d = v as Record<string, unknown>
  if (!("mfaRequired" in d) || typeof d.mfaRequired !== "boolean" || !d.mfaRequired) return false
  if (!("user" in d) || !isRecord(d.user)) return false
  const u = d.user as Record<string, unknown>
  return typeof u.id === "number" && typeof u.email === "string"
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<{
    blocked: boolean;
    unlockAt?: Date;
    requiresPinUnlock?: boolean;
    requiresSecurityQuestion?: boolean;
  } | null>(null)

  // Contador regressivo (mm:ss) até unlockAt, padronizado e centralizado
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!blocked?.unlockAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [blocked?.unlockAt])
  const countdown = useMemo(() => {
    if (!blocked?.unlockAt) return null
    const diff = Math.max(0, blocked.unlockAt.getTime() - now)
    const totalSec = Math.ceil(diff / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return { m, s }
  }, [blocked?.unlockAt, now])

  const emailOk = /.+@.+\..+/.test(email)
  const senhaOk = senha.length >= 6
  const canSubmit = emailOk && senhaOk && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBlocked(null)
    setLoading(true)
    
    try {
      const res = await apiClient.login({ email: email.trim(), senha })
      
      // Verificar se conta está bloqueada
      if (res.status === 423 && isBlockedData(res.data)) {
        const d = res.data
        setBlocked({
          blocked: true,
          unlockAt: d.unlockAt ? new Date(d.unlockAt) : undefined,
          requiresPinUnlock: d.requiresPinUnlock,
          requiresSecurityQuestion: d.requiresSecurityQuestion
        })
        setError("Conta temporariamente bloqueada devido a múltiplas tentativas incorretas.")
        return
      }
      
      if (!res.ok) {
        throw new Error(res.error || "Credenciais inválidas")
      }
      
      if (isMfaData(res.data)) {
        // Redirecionar para verificação MFA com dados do usuário
        const u = res.data.user
        const params = new URLSearchParams({
          userId: String(u.id),
          email: u.email,
          name: u.nomeCompleto || u.email,
          firstAccess: u.primeiroAcesso ? 'true' : 'false'
        })
        
        router.push(`/mfa?${params.toString()}`)
        return
      }
      
      // Login direto (não deveria acontecer com MFA obrigatório)
      router.replace("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-xl p-8">
          {/* Header com Logo */}
          <div className="text-center mb-8">
            <Image 
              src="/images/LOGO_300.png" 
              alt="GladPros" 
              width={80} 
              height={80} 
              className="mx-auto mb-4 rounded-xl"
              style={{ height: 'auto', width: 'auto' }}
            />
            <h1 className="text-2xl font-bold text-gray-800">Bem-vindo de volta!</h1>
            <p className="text-gray-600 text-sm mt-1">Entre com suas credenciais para continuar</p>
          </div>

          {/* Feedback de Erro */}
          {(error || blocked?.blocked) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              {error && <p className="text-red-700 text-sm font-medium">{error}</p>}
              {blocked?.blocked && (
                <p className="text-red-700 text-sm mt-1">
                  A sua conta está temporariamente bloqueada.
                </p>
              )}
              {blocked?.blocked && blocked.unlockAt && (
                <p className="text-red-600 text-xs mt-1">
                  Tente novamente em {countdown ? `${countdown.m.toString().padStart(2,'0')}:${countdown.s.toString().padStart(2,'0')}` : "00:00"}.
                </p>
              )}
              {blocked?.blocked && !blocked.unlockAt && (
                <p className="text-red-600 text-xs mt-1">Você já pode tentar novamente.</p>
              )}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={onSubmit} className="space-y-6">
            <AuthInput
              label="E-mail"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seu@exemplo.com"
              required
              error={!emailOk && email.length > 0 ? "E-mail inválido" : undefined}
            />

            <AuthPassword
              label="Senha"
              name="senha"
              value={senha}
              onChange={setSenha}
              placeholder="Mínimo 6 caracteres"
              required
              error={!senhaOk && senha.length > 0 ? "Mínimo de 6 caracteres" : undefined}
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-11 bg-[#0098DA] text-white font-medium rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              )}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Links de Apoio */}
          <div className="mt-8 space-y-3">
            <div className="text-center">
              <Link 
                href="/esqueci-senha" 
                className="text-[#0098DA] hover:text-[#0098DA]/80 text-sm font-medium transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Link de Desbloqueio (condicional) */}
            {blocked?.blocked && (blocked.requiresPinUnlock || blocked.requiresSecurityQuestion) && (
              <div className="text-center">
                <Link 
                  href={`/desbloqueio?email=${encodeURIComponent(email)}`}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                >
                  Desbloquear minha conta
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2025 GladPros. Sistema de gestão empresarial.
          </p>
        </div>
      </div>
    </div>
  )
}
