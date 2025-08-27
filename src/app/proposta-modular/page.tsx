import PropostaFormModular from '@modules/propostas/ui/PropostaFormModular'
import { ClientesProvider } from '@modules/propostas/ui/ClientesContext'

export default function PropostaModularPage() {
  return (
    <ClientesProvider>
      <PropostaFormModular />
    </ClientesProvider>
  )
}
