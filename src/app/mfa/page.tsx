"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef, Suspense, useCallback } from "react"

function MFAVerification() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Dados do usuário vindos da tela de login
  const userId = searchParams?.get('userId')
  const userEmail = searchParams?.get('email') || ''
  const userName = searchParams?.get('name') || ''
  const isFirstAccess = searchParams?.get('firstAccess') === 'true'
  
  const [code, setCode] = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const [canResend, setCanResend] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const autoSubmittedRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      router.push('/login')
      return
    }

    // Timer para expiração do código
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [userId, router])

  const handleSubmit = useCallback(async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Digite o código completo de 6 dígitos')
      return
    }
    if (loading || submitted) return
    setSubmitted(true)
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId!),
          code: fullCode,
          tipoAcao: isFirstAccess ? 'PRIMEIRO_ACESSO' : 'LOGIN'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido')
      }

      if (data.requiresSetup && data.redirectUrl) {
        // Primeiro acesso - redirecionar para configuração
        router.push(data.redirectUrl)
      } else {
        // Login normal - ir para dashboard
        router.push('/dashboard')
      }

    } catch (error) {
      console.error('Erro na verificação MFA:', error)
      setError((error as Error).message)
      
      // Limpar código em caso de erro
      setCode(Array(6).fill(''))
      inputRefs.current[0]?.focus()
  // Permitir novo auto-submit após correção
  autoSubmittedRef.current = false
      setSubmitted(false)
    } finally {
      setLoading(false)
    }
  }, [code, isFirstAccess, router, userId, loading, submitted])

  useEffect(() => {
    // Auto-submit quando todos os campos estão preenchidos (uma única vez)
    if (code.every(digit => digit !== '') && !loading && !submitted && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true
      handleSubmit()
    }
  }, [code, loading, submitted, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Apenas números

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Apenas o último dígito
    setCode(newCode)

    // Auto-focus no próximo campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      setCode(pastedData.split(''))
      inputRefs.current[5]?.focus()
    }
  }


  const handleResendCode = async () => {
    if (!canResend) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/mfa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId!),
          tipoAcao: isFirstAccess ? 'PRIMEIRO_ACESSO' : 'LOGIN'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao reenviar código')
      }

  // Resetar timer e estado
      setTimeLeft(300)
      setCanResend(false)
      setCode(Array(6).fill(''))
      inputRefs.current[0]?.focus()
  setInfo('Novo código enviado para seu email.')

    } catch (error) {
      console.error('Erro ao reenviar:', error)
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return <div>Redirecionando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Image 
            src="/images/LOGO_300.png" 
            alt="GladPros" 
            width={80} 
            height={80} 
            className="mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verificação de Segurança
          </h1>
          <p className="text-gray-600 text-sm">
            {isFirstAccess 
              ? 'Digite o código enviado para finalizar o primeiro acesso'
              : 'Digite o código de verificação enviado para seu email'
            }
          </p>
        </div>

        {/* Info do usuário */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{userName}</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
          </div>
        </div>

    {(error || info) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      {error && <p className="text-red-700 text-sm">{error}</p>}
      {info && <p className="text-green-700 text-sm">{info}</p>}
          </div>
        )}

        {/* Campos do código */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Código de Verificação
          </label>
          <div className="flex space-x-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                maxLength={1}
                disabled={loading || submitted}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Código expira em: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-600">
              Código expirado. Solicite um novo código.
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={submitted || loading || code.some(digit => digit === '') || timeLeft === 0}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
          >
            {(loading || submitted) && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />}
            {isFirstAccess ? 'Finalizar Primeiro Acesso' : 'Verificar e Entrar'}
          </button>

          <button
            onClick={handleResendCode}
            disabled={!canResend || loading}
            className="w-full py-2 px-4 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reenviar Código
          </button>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-6 border-t">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 text-sm mb-2">🔒 Dicas de Segurança:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• O código tem 6 dígitos e expira em 5 minutos</li>
              <li>• Nunca compartilhe este código com ninguém</li>
              <li>• Se não solicitou, feche esta janela</li>
            </ul>
          </div>
        </div>

        {/* Link para voltar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Voltar para Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MFAPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MFAVerification />
    </Suspense>
  )
}
