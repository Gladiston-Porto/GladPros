"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { ClienteCreateInput, ClienteUpdateInput } from "@/types/cliente";
import { Panel } from "@/components/GladPros";
import { useToast } from "@/components/ui/Toaster";

interface EditClientePageProps {
  params: Promise<{ id: string }>;
}

export default function EditClientePage({ params }: EditClientePageProps) {
  // Next.js 15: params é uma Promise. Use React.use() para obter o valor.
  const { id } = React.use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
  const fetchCliente = async () => {
      try {
    const response = await fetch(`/api/clientes/${id}`);
        if (!response.ok) {
          throw new Error('Cliente não encontrado');
        }
        const data = await response.json();
        if (!cancelled) setCliente(data);
      } catch (error: any) {
        if (cancelled) return;
        console.error('Erro ao carregar cliente:', error);
        // Evitar dependência do showToast no array; usar diretamente aqui
        showToast({ title: 'Erro', message: error.message || 'Erro ao carregar cliente', type: 'error' });
    router.push('/clientes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCliente();
    return () => { cancelled = true };
  }, [id]);

  const handleSubmit = async (data: ClienteCreateInput | ClienteUpdateInput) => {
    setOperationLoading(true);
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error?.details) {
          throw { message: error.error || error.message || 'Dados inválidos', details: error.details };
        }
        const msg: string = error?.error || error?.message || '';
        const fieldErrors: Record<string, string> = {};
        if (/e-mail.*cadastrado|E-mail.*cadastrado/i.test(msg)) fieldErrors.email = msg;
        if (/Documento.*cadastrado/i.test(msg)) {
          const d: any = data;
          if (d?.tipo === 'PJ' && d?.ein) fieldErrors.ein = msg;
          if (d?.tipo === 'PF') {
            if (d?.tipoDocumentoPF === 'SSN' && d?.ssn) fieldErrors.ssn = msg;
            if (d?.tipoDocumentoPF === 'ITIN' && d?.itin) fieldErrors.itin = msg;
          }
        }
        if (Object.keys(fieldErrors).length) throw { message: msg || 'Dados inválidos', fieldErrors };
        throw new Error(msg || 'Erro ao atualizar cliente');
      }

      showToast({ title: 'Sucesso', message: 'Cliente atualizado com sucesso', type: 'success' });
      router.push('/clientes');
    } catch (error: any) {
      if (error?.details) throw error;
      showToast({ title: 'Erro', message: error.message || 'Erro ao atualizar cliente', type: 'error' });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCancel = () => router.push('/clientes');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title text-xl">Editar Cliente</h2>
        </div>
        <Panel title="Carregando...">
          <div className="p-6 text-center text-gray-500">Carregando dados do cliente...</div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-title text-xl">Editar Cliente</h2>
      </div>

      <Panel title="Editar Cliente">
        <ClienteForm cliente={cliente} onSubmit={handleSubmit} onCancel={handleCancel} loading={operationLoading} />
      </Panel>
    </div>
  );
}