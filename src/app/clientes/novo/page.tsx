// src/app/clientes/novo/page.tsx  
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { ClienteCreateInput, ClienteUpdateInput } from "@/types/cliente";
import { Panel } from "@/components/GladPros";
import { useToast } from "@/components/ui/Toaster";

export default function NovoClientePage() {
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
        // Propagar erros de campo quando disponíveis
        if (error?.details) {
          throw { message: error.error || error.message || 'Dados inválidos', details: error.details };
        }
        // Heurística para mapear mensagens conhecidas a campos específicos
        const msg: string = error?.error || error?.message || '';
        const fieldErrors: Record<string, string> = {};
        if (/e-mail.*cadastrado|E-mail.*cadastrado/i.test(msg)) {
          fieldErrors.email = msg;
        }
        if (/Documento.*cadastrado/i.test(msg)) {
          // Deduzir campo do documento a partir do payload
          const d: any = data;
          if (d?.tipo === 'PJ' && d?.ein) fieldErrors.ein = msg;
          if (d?.tipo === 'PF') {
            if (d?.tipoDocumentoPF === 'SSN' && d?.ssn) fieldErrors.ssn = msg;
            if (d?.tipoDocumentoPF === 'ITIN' && d?.itin) fieldErrors.itin = msg;
          }
        }
        if (Object.keys(fieldErrors).length) throw { message: msg || 'Dados inválidos', fieldErrors };
        throw new Error(msg || 'Erro ao criar cliente');
      }

      showToast({ title: 'Sucesso', message: 'Cliente criado com sucesso', type: 'success' });
      router.push('/clientes');
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      // Repassar erro para o form exibir nos campos quando aplicável
      if (error?.details) throw error;
      showToast({ title: 'Erro', message: error.message || 'Erro ao criar cliente', type: 'error' });
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
