// src/modules/usuarios/pages/ListPage.tsx
"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Toolbar from "../ui/Toolbar";
import UsersTable from "../ui/UsersTable";
import { getUsers, deleteUser, toggleUserStatus } from "../client/usersApi";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import type { Usuario } from "../types";
import { Panel } from "@/components/GladPros";
import { useToast } from "@/components/ui/Toaster";

export default function UsersListPage() {
  const { confirm, Dialog } = useConfirm();
  const { showToast } = useToast();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<"nome" | "email" | "role" | "ativo" | "criadoEm">("criadoEm");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
  const res = await getUsers({ q, role, status, page, pageSize, sortKey, sortDir });
  setData(res.items);
  setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [q, role, status, page, pageSize, sortKey, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(id: number) {
    const ok = await confirm({ title: "Remover usuário", message: "Tem certeza que deseja remover este usuário?", confirmText: "Remover", tone: "danger" });
    if (!ok) return;
    try {
      await deleteUser(String(id));
      showToast({ title: 'Removido', message: 'Usuário removido com sucesso', type: 'success' });
      load();
    } catch (error) {
      console.error(error);
      showToast({ title: 'Erro', message: 'Falha ao remover usuário', type: 'error' });
    }
  }

  async function onToggleStatus(id: number, currentStatus: boolean) {
    const action = currentStatus ? "desativar" : "ativar";
    const ok = await confirm({ 
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} usuário`, 
      message: `Tem certeza que deseja ${action} este usuário?`, 
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      tone: currentStatus ? "danger" : "default"
    });
    if (!ok) return;
    
    try {
      await toggleUserStatus(String(id), !currentStatus);
  showToast({ title: 'Sucesso', message: 'Status atualizado', type: 'success' });
  load(); // Recarregar lista
    } catch (error) {
  console.error(error);
  showToast({ title: 'Erro', message: 'Erro ao alterar status do usuário', type: 'error' });
    }
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-title text-xl">Usuários</h2>
        <Link href="/usuarios/novo" className="rounded-2xl bg-[#0098DA] px-4 py-2 text-sm text-white hover:brightness-110">Novo Usuário</Link>
      </div>

  <Toolbar 
    q={q} 
    onQ={setQ} 
    role={role} 
    onRole={setRole} 
    status={status} 
    onStatus={setStatus} 
    total={total} 
    showNew={false} 
    users={data.filter(u => selectedIds.includes(u.id))} 
    scope="selected"
    exporting={exporting}
  onExportAllFiltered={async (format: string) => {
      try {
        setExporting(true);
        if (format === 'csv') {
          // Server CSV export for all filtered (implement route if needed)
          const res = await fetch('/api/usuarios/export/csv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filters: { q, role, status, sortKey, sortDir } })
          });
          if (!res.ok) throw new Error('Falha ao exportar CSV');
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'usuarios.csv'; a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const res = await fetch('/api/usuarios/export/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filters: { q, role, status, sortKey, sortDir } })
          });
          if (!res.ok) throw new Error('Falha ao exportar PDF');
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'usuarios.pdf'; a.click();
          window.URL.revokeObjectURL(url);
        }
      } finally {
        setExporting(false);
      }
    }}
  />

  <Panel title="Lista de Usuários">
        {loading ? (
          <div className="p-6 text-sm opacity-60">Carregando…</div>
        ) : (
          <UsersTable 
            data={data} 
            onEdit={(id: number) => (location.href = `/usuarios/${id}`)} 
            onDelete={onDelete} 
            onToggleStatus={onToggleStatus} 
            onSelectedChange={setSelectedIds}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={(k: 'nome' | 'email' | 'role' | 'ativo' | 'criadoEm', d: 'asc' | 'desc') => { setSortKey(k); setSortDir(d); }}
          />
        )}
      </Panel>
  <Dialog />

      <div className="flex items-center justify-between text-sm">
        <div className="opacity-60">Página {page} de {totalPages}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border px-3 py-1 disabled:opacity-50">Anterior</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border px-3 py-1 disabled:opacity-50">Próxima</button>
        </div>
      </div>
    </div>
  );
}
