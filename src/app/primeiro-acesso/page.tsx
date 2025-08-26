"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { PasswordService } from "@/lib/password"

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

function FirstAccessSetup() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams?.get('userId')

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dados do formulário
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  
  // Validação
  type PasswordStrength = ReturnType<typeof PasswordService.getPasswordStrength>
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null)

  const steps: SetupStep[] = [
    {
      id: "password",
      title: "Nova Senha",
      description: "Defina uma senha segura para sua conta",
      completed: false
    },
    {
      id: "pin", 
      title: "PIN de Segurança",
      description: "Crie um PIN de 4 dígitos para desbloqueio",
      completed: false
    },
    {
      id: "security",
      title: "Pergunta de Segurança", 
      description: "Configure uma pergunta para recuperação de conta",
      completed: false
    },
    {
      id: "confirm",
      title: "Confirmação",
      description: "Revise e finalize sua configuração",
      completed: false
    }
  ]

  const securityQuestions = [
    "Qual é o nome do seu primeiro animal de estimação?",
    "Em que cidade você nasceu?", 
    "Qual é o nome de solteira da sua mãe?",
    "Qual foi sua primeira escola?",
    "Qual é seu filme favorito?",
    "Qual é o nome da sua rua favorita?",
    "Qual foi seu primeiro emprego?",
    "Qual é sua comida favorita?"
  ]

  useEffect(() => {
    if (!userId) {
      router.push('/login')
      return
    }
  }, [userId, router])

  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(PasswordService.getPasswordStrength(newPassword))
    } else {
      setPasswordStrength(null)
    }
  }, [newPassword])

  const canProceedPassword = () => {
    if (!newPassword || !confirmPassword) return false
    if (newPassword !== confirmPassword) return false
    const validation = PasswordService.validatePassword(newPassword)
    return validation.valid
  }

  const canProceedPin = () => {
    return pin.length === 4 && confirmPin.length === 4 && pin === confirmPin && /^\d{4}$/.test(pin)
  }

  const canProceedSecurity = () => {
    return securityQuestion && securityAnswer.length >= 3
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleFinish()
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/first-access/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId!),
          newPassword,
          pin,
          securityQuestion,
          securityAnswer: securityAnswer.toLowerCase().trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao configurar conta')
      }

      // Sucesso - redirecionar para dashboard
      router.push('/dashboard?setup=complete')

    } catch (error) {
      console.error('Erro na configuração:', error)
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <Image 
              src="/images/LOGO_300.png" 
              alt="GladPros" 
              width={60} 
              height={60} 
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold">Bem-vindo ao GladPros!</h1>
              <p className="text-blue-100">Configure sua conta para começar</p>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar com steps */}
          <div className="w-1/3 bg-gray-50 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Passos da Configuração</h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    index === currentStep 
                      ? 'bg-blue-100 border-2 border-blue-300' 
                      : index < currentStep 
                        ? 'bg-green-100 border-2 border-green-300'
                        : 'bg-white border-2 border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index === currentStep 
                      ? 'bg-blue-500 text-white'
                      : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="w-2/3 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Nova Senha */}
            {currentStep === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Defina sua Nova Senha</h2>
                <p className="text-gray-600 mb-6">
                  Crie uma senha forte que será usada para acessar sua conta.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite sua nova senha"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite novamente sua senha"
                    />
                  </div>

                  {passwordStrength && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Força da Senha</span>
                        <span className={`text-sm font-semibold`} style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${passwordStrength.score}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        {passwordStrength.criteriaMet.map((criteria: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-green-500 text-xs">✓</span>
                            <span className="text-xs text-gray-600">{criteria}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm mb-2">Requisitos da Senha:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Mínimo 9 caracteres</li>
                      <li>• Pelo menos 1 letra maiúscula</li>
                      <li>• Pelo menos 1 número</li>
                      <li>• Pelo menos 1 símbolo (!@#$%&*)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: PIN de Segurança */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">PIN de Segurança</h2>
                <p className="text-gray-600 mb-6">
                  Crie um PIN de 4 dígitos que será usado para desbloquear sua conta em casos de bloqueio.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN (4 dígitos)
                    </label>
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setPin(value)
                      }}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                      placeholder="****"
                      maxLength={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar PIN
                    </label>
                    <input
                      type="password"
                      value={confirmPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setConfirmPin(value)
                      }}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                      placeholder="****"
                      maxLength={4}
                    />
                  </div>

                  {pin && confirmPin && pin !== confirmPin && (
                    <p className="text-red-600 text-sm">Os PINs não coincidem</p>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 text-sm mb-2">🔒 Sobre o PIN:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Use apenas números (0-9)</li>
                      <li>• Evite sequências óbvias (1234, 0000)</li>
                      <li>• Será necessário para desbloquear a conta</li>
                      <li>• Mantenha-o seguro e não compartilhe</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pergunta de Segurança */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pergunta de Segurança</h2>
                <p className="text-gray-600 mb-6">
                  Escolha uma pergunta de segurança que será usada para recuperar sua conta.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pergunta de Segurança
                    </label>
                    <select
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma pergunta...</option>
                      {securityQuestions.map((question, index) => (
                        <option key={index} value={question}>{question}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resposta
                    </label>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite sua resposta"
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm mb-2">💡 Dicas:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Escolha algo que você nunca esquecerá</li>
                      <li>• Seja específico na resposta</li>
                      <li>• Use apenas letras minúsculas</li>
                      <li>• Evite acentos e caracteres especiais</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmação */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuração Completa</h2>
                <p className="text-gray-600 mb-6">
                  Revise suas configurações antes de finalizar.
                </p>

                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">✓ Configurações Definidas:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Nova senha:</span>
                        <span className="text-green-800 font-medium">••••••••••</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">PIN de segurança:</span>
                        <span className="text-green-800 font-medium">••••</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Pergunta de segurança:</span>
                        <span className="text-green-800 font-medium">Configurada</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm mb-2">🎉 Próximos Passos:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Sua senha provisória será substituída</li>
                      <li>• Você será redirecionado para o dashboard</li>
                      <li>• Poderá acessar todas as funcionalidades do sistema</li>
                      <li>• Suas configurações de segurança estarão ativas</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 0 || loading}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <button
                onClick={handleNext}
                disabled={
                  loading || 
                  (currentStep === 0 && !canProceedPassword()) ||
                  (currentStep === 1 && !canProceedPin()) ||
                  (currentStep === 2 && !canProceedSecurity())
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />}
                {currentStep === steps.length - 1 ? 'Finalizar Configuração' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FirstAccessPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <FirstAccessSetup />
    </Suspense>
  )
}
