"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense, useCallback } from "react"
import AuthInput from "@/components/ui/AuthInput"
// import AuthPassword from "@/components/ui/AuthPassword" // not used

// Evitar pre-render estático nesta rota
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function DesbloqueioView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams?.get('email') || ''
  
  const [step, setStep] = useState<'identify' | 'pin' | 'security'>('identify')
  const [email, setEmail] = useState(emailParam)
  const [pin, setPin] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [userInfo, setUserInfo] = useState<{
    id: number;
    email: string;
    nomeCompleto: string;
    requiresPinUnlock: boolean;
    requiresSecurityQuestion: boolean;
    perguntaSecreta?: string;
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Buscar informações do usuário bloqueado
  const checkUserStatus = useCallback(async () => {
    if (!email.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao verificar usuário')
      }
      
      if (!result.blocked) {
        setError('Esta conta não está bloqueada.')
        return
      }
      
      setUserInfo(result.user)
      
      // Determinar método de desbloqueio disponível
      if (result.user.requiresPinUnlock) {
        setStep('pin')
      } else if (result.user.requiresSecurityQuestion) {
        setStep('security')
      } else {
        setError('Esta conta não possui métodos de desbloqueio configurados. Entre em contato com o administrador.')
      }
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [email])

  // Desbloquear com PIN
  async function unlockWithPin() {
    if (!userInfo || !pin.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'pin',
          userId: userInfo.id,
          pin: pin.trim()
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'PIN inválido')
      }
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao desbloquear conta'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Desbloquear com pergunta de segurança
  async function unlockWithSecurity() {
    if (!userInfo || !securityAnswer.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'security',
          userId: userInfo.id,
          answer: securityAnswer.trim()
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Resposta inválida')
      }
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao desbloquear conta'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-check se email foi passado por parâmetro
  useEffect(() => {
    if (emailParam && step === 'identify') {
      // call without adding function to deps to avoid re-creation loops
      checkUserStatus()
    }
  }, [emailParam, step, checkUserStatus])

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Conta Desbloqueada!</h1>
            <p className="text-gray-600 mb-4">
              Sua conta foi desbloqueada com sucesso. Você será redirecionado para a página de login.
            </p>
            <div className="text-sm text-gray-500">
              Redirecionando em 2 segundos...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Image 
              src="/images/LOGO_300.png" 
              alt="GladPros" 
              width={80} 
              height={80} 
              className="mx-auto mb-4 rounded-xl"
              style={{ height: 'auto' }}
            />
            <h1 className="text-2xl font-bold text-gray-800">Desbloquear Conta</h1>
            <p className="text-gray-600 text-sm mt-1">
              {step === 'identify' && "Informe seu email para verificar opções de desbloqueio"}
              {step === 'pin' && "Digite seu PIN de 4 dígitos para desbloquear"}
              {step === 'security' && "Responda sua pergunta de segurança"}
            </p>
          </div>

          {/* Feedback de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Etapa 1: Identificação */}
          {step === 'identify' && (
            <form onSubmit={(e) => { e.preventDefault(); checkUserStatus(); }} className="space-y-6">
              <AuthInput
                label="E-mail da conta bloqueada"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@exemplo.com"
                required
              />

              <button
                type="submit"
                disabled={loading || !/.+@.+\..+/.test(email)}
                className="w-full h-11 bg-[#0098DA] text-white font-medium rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                )}
                {loading ? "Verificando..." : "Verificar Conta"}
              </button>
            </form>
          )}

          {/* Etapa 2: Desbloqueio com PIN */}
          {step === 'pin' && userInfo && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-1">Conta Identificada</h3>
                <p className="text-blue-700 text-sm">{userInfo.nomeCompleto}</p>
                <p className="text-blue-600 text-xs">{userInfo.email}</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); unlockWithPin(); }} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    PIN de Segurança (4 dígitos)
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setPin(value)
                    }}
                    placeholder="****"
                    maxLength={4}
                    className="w-32 h-11 rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-[#0098DA] focus:outline-none focus:ring-2 focus:ring-[#0098DA]/20 transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('identify')}
                    className="flex-1 h-11 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || pin.length !== 4}
                    className="flex-1 h-11 bg-[#0098DA] text-white font-medium rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {loading && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    )}
                    {loading ? "Desbloqueando..." : "Desbloquear"}
                  </button>
                </div>

                {/* Opção alternativa */}
                {userInfo.requiresSecurityQuestion && (
                  <div className="text-center pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setStep('security')}
                      className="text-[#0098DA] hover:text-[#0098DA]/80 text-sm font-medium transition-colors"
                    >
                      Usar pergunta de segurança
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Etapa 3: Desbloqueio com Pergunta de Segurança */}
          {step === 'security' && userInfo && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-1">Conta Identificada</h3>
                <p className="text-blue-700 text-sm">{userInfo.nomeCompleto}</p>
                <p className="text-blue-600 text-xs">{userInfo.email}</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); unlockWithSecurity(); }} className="space-y-6">
                {userInfo.perguntaSecreta && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h3 className="font-medium text-yellow-800 mb-1">Pergunta de Segurança</h3>
                    <p className="text-yellow-700 text-sm">{userInfo.perguntaSecreta}</p>
                  </div>
                )}

                <AuthInput
                  label="Resposta de Segurança"
                  name="security-answer"
                  value={securityAnswer}
                  onChange={setSecurityAnswer}
                  placeholder="Digite sua resposta"
                  required
                />

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600 text-xs">
                    💡 <strong>Dica:</strong> Digite a resposta exatamente como cadastrou, sem acentos e em letras minúsculas.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('identify')}
                    className="flex-1 h-11 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !securityAnswer.trim()}
                    className="flex-1 h-11 bg-[#0098DA] text-white font-medium rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {loading && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    )}
                    {loading ? "Desbloqueando..." : "Desbloquear"}
                  </button>
                </div>

                {/* Opção alternativa */}
                {userInfo.requiresPinUnlock && (
                  <div className="text-center pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setStep('pin')}
                      className="text-[#0098DA] hover:text-[#0098DA]/80 text-sm font-medium transition-colors"
                    >
                      Usar PIN de segurança
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Links de Apoio */}
          <div className="mt-8 pt-6 border-t space-y-3">
            <div className="text-center">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                Voltar para Login
              </Link>
            </div>
            <div className="text-center">
              <Link 
                href="/esqueci-senha" 
                className="text-[#0098DA] hover:text-[#0098DA]/80 text-sm font-medium transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>
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

export default function DesbloqueioPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DesbloqueioView />
    </Suspense>
  )
}
