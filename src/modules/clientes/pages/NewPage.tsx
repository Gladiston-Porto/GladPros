"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClienteForm } from "@/modules/clientes/ui/ClienteForm";
import { ClienteCreateInput, ClienteUpdateInput } from "@/types/cliente";
import { Panel } from "@/components/GladPros";
import { useToast } from "@/components/ui/Toaster";

export default function NewPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: ClienteCreateInput | ClienteUpdateInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error?.details) {
          throw { message: error.error || error.message || 'Dados inválidos', details: error.details };
        }
        const msg: string = error?.error || error?.message || '';
        const fieldErrors: Record<string, string> = {};
          if (/e-mail.*cadastrado|E-mail.*cadastrado/i.test(msg)) {
            fieldErrors.email = msg;
          }
          if (/Documento.*cadastrado/i.test(msg)) {
        const d = data as unknown as Record<string, unknown>;
            if (d?.tipo === 'PJ' && typeof d['ein'] === 'string' && d['ein']) fieldErrors.ein = msg;
            if (d?.tipo === 'PF') {
          if ((d?.tipoDocumentoPF as string) === 'SSN' && typeof d['ssn'] === 'string' && d['ssn']) fieldErrors.ssn = msg;
          if ((d?.tipoDocumentoPF as string) === 'ITIN' && typeof d['itin'] === 'string' && d['itin']) fieldErrors.itin = msg;
            }
          }
        if (Object.keys(fieldErrors).length) throw { message: msg || 'Dados inválidos', fieldErrors };
        throw new Error(msg || 'Erro ao criar cliente');
      }

      showToast({ title: 'Sucesso', message: 'Cliente criado com sucesso', type: 'success' });
      router.push('/clientes');
    } catch (error: unknown) {
      console.error('Erro ao criar cliente:', error);
      if ((error as { details?: unknown })?.details) throw error;
      const msg = (error as { message?: string })?.message ?? String(error);
      showToast({ title: 'Erro', message: msg || 'Erro ao criar cliente', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/clientes');
  };

  return (
    <div className="space-y-4">
      <Panel title="Novo Cliente">
        <ClienteForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </Panel>
    </div>
  );
}
