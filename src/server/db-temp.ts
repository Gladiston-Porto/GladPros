// Arquivo temporário de banco de dados - substitui o db.ts até resolver o Prisma
import { PrismaClient } from '../types/prisma-temp'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Estender a classe PrismaClient com métodos adicionais
class ExtendedPrismaClient extends PrismaClient {
  async generatePropostaNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `PROP-${year}${month}${day}-${random}`
  }
}

export const db = globalForPrisma.prisma ?? new ExtendedPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Função para gerar número de proposta temporária (mantida para compatibilidade)
export function generatePropostaNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `PROP-${year}${month}${day}-${random}`
}
