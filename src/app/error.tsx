"use client"
import Image from 'next/image'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Image
            src="/images/LOGO_300.png"
            alt="GladPros"
            width={200}
            height={60}
            className="mx-auto opacity-70"
          />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M5 7l.867 12.142A2 2 0 007.86 21h8.28a2 2 0 001.993-1.858L19 7m-7 4v6m-4-6v6m8-6v6" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Erro Interno do Servidor</h1>
              <p className="text-gray-600 mb-6">Ocorreu um problema ao processar sua solicitação. Tente novamente em instantes.</p>
              {process.env.NODE_ENV !== 'production' && (
                <p className="text-xs text-gray-400 mb-4 break-all">{error?.message}</p>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => reset()}
                  className="w-full bg-gray-800 hover:bg-black text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Tentar Novamente
                </button>
                <a
                  href="/dashboard"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Ir para Dashboard
                </a>
              </div>
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>&copy; 2025 GladPros. Todos os direitos reservados.</p>
              </div>
            </div>
          </div>
        </div>
  )
}
