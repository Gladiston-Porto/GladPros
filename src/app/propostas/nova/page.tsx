// src/app/propostas/nova/page.tsx
import DashboardShell, { AppUser } from "@/components/GladPros";
import { requireServerUser } from "@/lib/requireServerUser";
import PropostaForm from "@modules/propostas/ui/PropostaForm";
import { ClientesProvider } from "@modules/propostas/ui/ClientesContext";

export default async function NovaPropostaPage() {
  const user = (await requireServerUser()) as unknown as AppUser;
  
  return (
    <DashboardShell user={user}>
      <ClientesProvider>
        <PropostaForm />
      </ClientesProvider>
    </DashboardShell>
  );
}
