// src/modules/clientes/pages/ListPage.tsx
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Toolbar from "../components/Toolbar";
import { Pagination } from "@/components/clientes/Pagination";
import ClientesTable from "../components/ClientesTable";
import { getClientes, deleteCliente, toggleClienteStatus } from "../services/clientesApi";
import { runBulkAction, needsExportWarning } from "../services/bulkService";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import type { ClienteDTO } from "@/types/cliente";
import { Panel } from "@/components/GladPros";
import { useToast } from "@/components/ui/Toaster";

export default function ClientesListPage() {
  const { confirm, Dialog } = useConfirm();
  const { showToast } = useToast();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  // Mostrar apenas ativos por padrão
  const [status, setStatus] = useState("ATIVO");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<ClienteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exportScope, setExportScope] = useState<'selected' | 'allFiltered'>('allFiltered');
  const [sortKey, setSortKey] = useState<'nome' | 'tipo' | 'email' | 'telefone' | 'documento' | 'cidadeEstado' | 'status'>('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState("");
  // debounce
  useEffect(() => {
    const t = setTimeout(() => setQ(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await getClientes({ 
        q, 
        tipo: tipo as any, 
        ativo: status === 'ATIVO' ? true : status === 'INATIVO' ? false : 'all',
        page, 
        pageSize,
        sortKey,
        sortDir
      }, signal);
      setData(res.data);
      setTotal(res.total);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, [q, tipo, status, page, pageSize, sortKey, sortDir]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function onDelete(id: number) {
    const ok = await confirm({ 
      title: "Excluir cliente", 
      message: "Tem certeza que deseja excluir este cliente?", 
      confirmText: "Excluir", 
      tone: "danger" 
    });
    if (!ok) return;
    try {
      await deleteCliente(String(id));
      showToast({ title: 'Excluído', message: 'Cliente excluído com sucesso', type: 'success' });
      load();
    } catch (error) {
      console.error(error);
      showToast({ title: 'Erro', message: 'Falha ao excluir cliente', type: 'error' });
    }
  }

  async function onToggleStatus(id: number, currentStatus: boolean) {
    const action = currentStatus ? "desativar" : "ativar";
    const ok = await confirm({ 
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} cliente`, 
      message: `Tem certeza que deseja ${action} este cliente?`, 
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      tone: currentStatus ? "danger" : "default"
    });
    if (!ok) return;
    
    try {
      await toggleClienteStatus(String(id), !currentStatus);
      showToast({ title: 'Sucesso', message: 'Status atualizado', type: 'success' });
      load(); // Recarregar lista
    } catch (error) {
      console.error(error);
      showToast({ title: 'Erro', message: 'Erro ao alterar status do cliente', type: 'error' });
    }
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-title text-xl">Clientes</h2>
        <Link href="/clientes/novo" className="rounded-2xl bg-[#0098DA] px-4 py-2 text-sm text-white hover:brightness-110">Novo Cliente</Link>
      </div>

      <Toolbar 
        q={searchTerm} 
        onQ={setSearchTerm}
        tipo={tipo}
        onTipo={setTipo}
        status={status}
        onStatus={setStatus}
        total={total}
        showNew={false}
        clientes={data}
        scope={exportScope}
        selectedCount={selectedIds.length}
        onScopeChange={(s) => setExportScope(s)}
        loading={loading}
      />

      <Panel title="Lista de Clientes">
        {loading ? (
          <div className="p-6 text-sm opacity-60">Carregando…</div>
        ) : (
          <ClientesTable 
            data={data} 
            onEdit={(id: number) => (location.href = `/clientes/${id}`)} 
            onDelete={onDelete} 
            onToggleStatus={onToggleStatus}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={(key, dir) => {
              setSortKey(key);
              setSortDir(dir);
              setPage(1);
            }}
            onSelectedChange={setSelectedIds}
          />
        )}
      </Panel>
      <Dialog />

      <div className="flex items-center justify-between text-sm">
        <div className="opacity-60">Página {page} de {totalPages}</div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={async () => {
                  const ok = await confirm({ title: 'Ativar selecionados', message: `Ativar ${selectedIds.length} cliente(s)?`, confirmText: 'Ativar' });
                  if (!ok) return;
                  try {
                    await runBulkAction({ action: 'activate', scope: 'selected', ids: selectedIds });
                    showToast({ title: 'Sucesso', message: 'Clientes ativados', type: 'success' });
                    setSelectedIds([]);
                    load();
                  } catch (e) {
                    showToast({ title: 'Erro', message: 'Falha ao ativar selecionados', type: 'error' });
                  }
                }}
                className="rounded-lg border px-3 py-1"
              >Ativar Selecionados</button>
              <button
                onClick={async () => {
                  const ok = await confirm({ title: 'Desativar selecionados', message: `Desativar ${selectedIds.length} cliente(s)?`, confirmText: 'Desativar', tone: 'danger' });
                  if (!ok) return;
                  try {
                    await runBulkAction({ action: 'deactivate', scope: 'selected', ids: selectedIds });
                    showToast({ title: 'Sucesso', message: 'Clientes desativados', type: 'success' });
                    setSelectedIds([]);
                    load();
                  } catch (e) {
                    showToast({ title: 'Erro', message: 'Falha ao desativar selecionados', type: 'error' });
                  }
                }}
                className="rounded-lg border px-3 py-1"
              >Desativar Selecionados</button>
              <button
                onClick={async () => {
                  const ok = await confirm({ title: 'Excluir selecionados', message: `Excluir ${selectedIds.length} cliente(s)? Essa ação não pode ser desfeita.`, confirmText: 'Excluir', tone: 'danger' });
                  if (!ok) return;
                  try {
                    await runBulkAction({ action: 'delete', scope: 'selected', ids: selectedIds });
                    showToast({ title: 'Sucesso', message: 'Clientes excluídos', type: 'success' });
                    setSelectedIds([]);
                    load();
                  } catch (e) {
                    showToast({ title: 'Erro', message: 'Falha ao excluir selecionados', type: 'error' });
                  }
                }}
                className="rounded-lg border px-3 py-1 text-red-600"
              >Excluir Selecionados</button>
            </>
          )}

          {/* Anterior / Próximo buttons like Users module */}
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border px-3 py-1 disabled:opacity-50">Anterior</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border px-3 py-1 disabled:opacity-50">Próximo</button>
        </div>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>
    </div>
  );
}
