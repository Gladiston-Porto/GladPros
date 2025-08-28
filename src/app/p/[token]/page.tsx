import { notFound } from 'next/navigation'
import ClientPropostaView from '@modules/propostas/ui/ClientPropostaView'
import { db } from '@/server/db-temp'
import { PropostaWithRelations } from '@/types/propostas'

// Local narrow shape used only for safely reading numeroProposta in metadata
type PropostaMeta = { numeroProposta?: string | null }

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

  return proposta as PropostaWithRelations | null
  } catch {
    console.error('Error fetching proposal')
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

  const numero = (proposta as unknown as PropostaMeta).numeroProposta ?? ''
  return {
    title: `Proposta ${numero} - GladPros`,
    description: `Visualização da proposta comercial ${numero}`,
  }
}
