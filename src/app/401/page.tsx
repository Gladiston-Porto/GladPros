'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Unauthorized() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-50 to-red-100 flex items-center justify-center px-4">
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

        {/* Erro 401 */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">401</h1>
          <h2 className="text-xl font-semibold text-red-600 mb-4">Acesso Não Autorizado</h2>
          
          <p className="text-gray-600 mb-6">
            Você precisa estar logado para acessar esta página. 
            Suas credenciais podem ter expirado ou você não tem as permissões necessárias.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Fazer Login
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>

          {/* Link de suporte */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Precisa de ajuda?</p>
            <a 
              href="mailto:suporte@gladpros.com" 
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Entre em contato com o suporte
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
