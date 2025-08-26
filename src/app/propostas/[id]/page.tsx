import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PropostaDetails from '@/modules/propostas/components/PropostaDetails'

interface PropostaPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PropostaPageProps): Promise<Metadata> {
  return {
    title: `Proposta ${params.id} - GladPros`,
    description: 'Detalhes da proposta comercial',
  }
}

export default async function PropostaPage({ params }: PropostaPageProps) {
  // TODO: Fetch proposta data and validate access
  
  return (
    <div className="container mx-auto py-6">
      <PropostaDetails propostaId={params.id} />
    </div>
  )
}
