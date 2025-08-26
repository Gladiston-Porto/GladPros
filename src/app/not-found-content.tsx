'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function NotFoundContent() {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/images/LOGO_300.png"
            alt="GladPros"
            width={200}
            height={60}
            className="mx-auto opacity-70"
          />
        </div>

        {/* Erro 404 */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-blue-200">
          <div className="text-blue-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.347 0-4.518.695-6.364 1.889L4 16l1.636.999A7.962 7.962 0 0112 15a7.962 7.962 0 016.364 1.889L20 16l-1.636-.999z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-blue-600 mb-4">Página Não Encontrada</h2>
          
          <p className="text-gray-600 mb-6">
            Ops! A página que você está procurando não existe ou foi movida para outro local.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Ir para Dashboard
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>

          {/* Links úteis */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3">Links Úteis</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-700 py-1"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/usuarios')}
                className="text-blue-600 hover:text-blue-700 py-1"
              >
                Usuários
              </button>
              <button
                onClick={() => router.push('/clientes')}
                className="text-blue-600 hover:text-blue-700 py-1"
              >
                Clientes
              </button>
              <button
                onClick={() => router.push('/projetos')}
                className="text-blue-600 hover:text-blue-700 py-1"
              >
                Projetos
              </button>
            </div>
          </div>

          {/* Link de suporte */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Não encontrou o que procura?</p>
            <a 
              href="mailto:suporte@gladpros.com" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Fale com nosso suporte
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 GladPros. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
