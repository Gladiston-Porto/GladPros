"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClienteForm } from "@/modules/clientes/ui/ClienteForm";
import { ClienteCreateInput, ClienteUpdateInput } from "@/types/cliente";
import { Panel } from "@/components/GladPros";
import { useToast } from "@/components/ui/Toaster";

interface EditClientePageProps {
  params: { id: string };
}

export default function DetailPage({ params }: EditClientePageProps) {
  const id = params?.id || ''
 
  const router = useRouter();
  const { showToast } = useToast();
  const [cliente, setCliente] = useState<Record<string, unknown> | null>(null);
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
  const data = await response.json() as Record<string, unknown>;
        if (!cancelled) setCliente(data);
      } catch (unknownError) {
        if (cancelled) return;
        console.error('Erro ao carregar cliente:', unknownError);
        const e = unknownError as Error
        showToast({ title: 'Erro', message: e.message || 'Erro ao carregar cliente', type: 'error' });
        router.push('/clientes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCliente();
    return () => { cancelled = true };
  }, [id, router, showToast]);

  const handleSubmit = async (data: ClienteCreateInput | ClienteUpdateInput) => {
    setOperationLoading(true);
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data as Record<string, unknown>),
      });

      if (!response.ok) {
        const errBody = await response.json() as Record<string, unknown>;
        if (errBody?.details) {
          throw { message: String(errBody.error || errBody.message || 'Dados inválidos'), details: errBody.details };
        }
        const msg: string = (errBody?.error as string) || (errBody?.message as string) || '';
        const fieldErrors: Record<string, string> = {};
        if (/e-mail.*cadastrado|E-mail.*cadastrado/i.test(msg)) fieldErrors.email = msg;
        if (/Documento.*cadastrado/i.test(msg)) {
    const d = data as Record<string, unknown>;
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
    } catch (err) {
      const error = err as { message?: string; details?: unknown };
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
