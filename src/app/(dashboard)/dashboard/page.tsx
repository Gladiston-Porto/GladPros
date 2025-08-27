// app/(dashboard)/page.tsx
import { Panel } from "@/components/GladPros";

export default function DashboardPage() {
  return (
    <>
      <section className="rounded-3xl border p-6 shadow-lg">
        <h1 className="font-title text-2xl">Painel Operacional</h1>
        <p className="mt-1 text-sm opacity-70">Bem-vindo!</p>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Projetos Ativos" />
        <Panel title="Invoices Pendentes" />
        <Panel title="Alertas" />
        <Panel title="SLA (7d)" />
      </div>
    </>
  );
}
