// src/app/propostas/nova/page.tsx
import { ReactNode } from "react";
import DashboardShell, { AppUser } from "@/components/GladPros";
import { requireServerUser } from "@/lib/requireServerUser";
import { PropostaFormNova } from "@/components/propostas";
import { ClientesProvider } from "@/components/propostas/ClientesContext";

export default async function NovaPropostaPage() {
  const user = (await requireServerUser()) as unknown as AppUser;
  
  return (
    <DashboardShell user={user}>
      <ClientesProvider>
        <PropostaFormNova />
      </ClientesProvider>
    </DashboardShell>
  );
}
