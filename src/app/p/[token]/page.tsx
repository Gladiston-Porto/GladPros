import { notFound } from 'next/navigation'
import ClientPropostaView from '@modules/propostas/ui/ClientPropostaView'
import { db } from '@/server/db-temp'
import { PropostaWithRelations } from '@/types/propostas'

interface Props {
  params: {
    token: string
  }
}

async function getPropostaByToken(token: string): Promise<PropostaWithRelations | null> {
  try {
    const proposta = await db.proposta.findFirst({
      where: {
        numeroProposta: token,
        deletedAt: null
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        etapas: {
          orderBy: { ordem: 'asc' }
        },
        materiais: {
          orderBy: { createdAt: 'asc' }
        },
        anexos: {
          orderBy: { createdAt: 'asc' }
        },
        logs: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return proposta as any
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return null
  }
}

export default async function ClientPropostaPage({ params }: Props) {
  const { token } = await params
  const proposta = await getPropostaByToken(token)

  if (!proposta) {
    notFound()
  }

  return <ClientPropostaView proposta={proposta} token={token} />
}

// Generate metadata
export async function generateMetadata({ params }: Props) {
  const { token } = await params
  const proposta = await getPropostaByToken(token)

  if (!proposta) {
    return {
      title: 'Proposta não encontrada'
    }
  }

  return {
    title: `Proposta ${(proposta as any).numeroProposta} - GladPros`,
    description: `Visualização da proposta comercial ${(proposta as any).numeroProposta}`,
  }
}
