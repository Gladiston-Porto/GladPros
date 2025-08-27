// src/modules/propostas/components/Toolbar.tsx
"use client";
import { Search, Download, ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
// ...existing code...
import { useState, useRef, useEffect } from "react";
import type { PropostaDTO } from '../services/propostasApi';
import type { StatusProposta } from '@/types/propostas';
import { exportToCSV, exportToPDF, exportToCSVServer } from "../services/exportService";
import { needsExportWarning } from "../services/bulkService";
import { useToast } from "@/components/ui/Toaster";

interface ToolbarProps {
  q: string;
  onQ: (value: string) => void;
  status: StatusProposta | 'all' | '' | string;
  onStatus: (value: StatusProposta | 'all' | '' | string) => void;
  clienteId: string;
  onClienteId: (value: string) => void;
  total: number;
  showNew?: boolean;
  propostas: PropostaDTO[];
  scope?: 'selected' | 'allFiltered';
  selectedCount?: number;
  onScopeChange?: (s: 'selected' | 'allFiltered') => void;
  loading?: boolean;
  clientes?: Array<{id: string, nome: string}>;
}

export default function Toolbar({
  q,
  onQ,
  status,
  onStatus,
  clienteId,
  onClienteId,
  total,
  showNew = true,
  propostas,
  scope = 'allFiltered',
  selectedCount = 0,
  onScopeChange,
  loading = false,
  clientes = []
}: ToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [clienteMenuOpen, setClienteMenuOpen] = useState(false);
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  // used placeholder to remind future feature; avoid unused-var lint
  void scopeMenuOpen;
  const statusRef = useRef<HTMLDivElement>(null);
  const clienteRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf') => {
    setShowExportMenu(false);
    setExporting(true);

    const currentScope = scope || 'allFiltered';
    const count = currentScope === 'selected' ? (selectedCount || 0) : total;
    
    if (count === 0) {
      showToast({ title: 'Aviso', message: 'Nenhuma proposta para exportar', type: 'info' });
      setExporting(false);
      return;
    }
    
    if (needsExportWarning(count)) {
      const proceed = window.confirm(`Você está prestes a exportar ${count} registros. Isso pode demorar. Deseja continuar?`);
      if (!proceed) {
        setExporting(false);
        return;
      }
    }

    try {
      if (format === 'csv') {
        if (currentScope === 'selected') {
          exportToCSV(propostas, 'propostas');
        } else {
          await exportToCSVServer({ 
            filename: 'propostas', 
            filters: { 
              q, 
              status: (status === '' || status === 'all') ? undefined : status, 
              clienteId: clienteId === '' ? undefined : clienteId 
            } 
          });
        }
        showToast({ title: 'Exportado', message: 'CSV gerado com sucesso', type: 'success' });
      } else {
        if (currentScope === 'selected') {
          await exportToPDF(propostas, 'propostas');
        } else {
          // Server-side PDF export
          const response = await fetch('/api/propostas/export/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              filename: 'propostas', 
              filters: { 
                q, 
                status: (status === '' || status === 'all') ? undefined : status, 
                clienteId: clienteId === '' ? undefined : clienteId 
              } 
            })
          });
          
          if (!response.ok) throw new Error('Falha ao exportar PDF');
          
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'propostas.pdf';
          a.click();
          URL.revokeObjectURL(url);
        }
        showToast({ title: 'Exportado', message: 'PDF gerado com sucesso', type: 'success' });
      }
    } catch {
      console.error('Erro ao exportar:');
      showToast({ 
        title: 'Erro', 
        message: 'Erro ao exportar', 
        type: 'error' 
      });
    } finally {
      setExporting(false);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
      if (clienteRef.current && !clienteRef.current.contains(event.target as Node)) {
        setClienteMenuOpen(false);
      }
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setScopeMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'RASCUNHO': return 'Rascunho';
      case 'ENVIADA': return 'Enviada';
      case 'ASSINADA': return 'Assinada';
      case 'APROVADA': return 'Aprovada';
      case 'CANCELADA': return 'Cancelada';
      default: return 'Todos os Status';
    }
  };

  const getClienteLabel = (value: string) => {
    if (!value) return 'Todos os Clientes';
    const cliente = clientes.find(c => c.id === value);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => onQ((e.target as HTMLInputElement).value)}
            placeholder="Buscar por título, número ou cliente"
            className="w-[260px] rounded-xl border border-black/10 bg-white px-9 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-[#0098DA] dark:border-white/10 dark:bg-white/5 text-foreground"
          />
        </div>

        <div className="relative" data-slot="status-menu" ref={statusRef}>
          <button
            onClick={() => setStatusMenuOpen(v => !v)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 text-foreground"
            aria-haspopup="menu"
            aria-expanded={statusMenuOpen}
          >
            {status === '' ? 'Todos os Status' : getStatusLabel(status)}
            <span className="ml-2">▾</span>
          </button>
          {statusMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-40 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 z-20">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onStatus(''); setStatusMenuOpen(false); }}>Todos</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onStatus('RASCUNHO'); setStatusMenuOpen(false); }}>Rascunho</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onStatus('ENVIADA'); setStatusMenuOpen(false); }}>Enviada</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onStatus('ASSINADA'); setStatusMenuOpen(false); }}>Assinada</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onStatus('APROVADA'); setStatusMenuOpen(false); }}>Aprovada</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onStatus('CANCELADA'); setStatusMenuOpen(false); }}>Cancelada</button>
            </div>
          )}
        </div>

        <div className="relative" data-slot="cliente-menu" ref={clienteRef}>
          <button
            onClick={() => setClienteMenuOpen(v => !v)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 text-foreground"
            aria-haspopup="menu"
            aria-expanded={clienteMenuOpen}
          >
            {getClienteLabel(clienteId)}
            <span className="ml-2">▾</span>
          </button>
          {clienteMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 z-20 max-h-60 overflow-y-auto">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onClienteId(''); setClienteMenuOpen(false); }}>Todos os Clientes</button>
              {clientes.map((cliente) => (
                <button key={cliente.id} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { onClienteId(cliente.id); setClienteMenuOpen(false); }}>{cliente.nome}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* seletor de escopo de exportação (quando suportado) */}
        {onScopeChange && (
          <select
            value={scope}
            onChange={(e) => onScopeChange(e.target.value as 'selected' | 'allFiltered')}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            title="Escopo de exportação"
          >
            <option value="selected">Selecionados</option>
            <option value="allFiltered">Todos os filtrados</option>
          </select>
        )}

        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={loading || exporting}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exportando…' : 'Exportar'}
            <ChevronDown className="h-3 w-3" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
              >
                <span>📊</span>
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 rounded-b-lg flex items-center gap-2"
              >
                <span>📄</span>
                <span>Exportar PDF</span>
              </button>
            </div>
          )}
        </div>

        {showNew && (
          <Link href="/propostas/nova" className="rounded-2xl bg-[#0098DA] px-4 py-2 text-sm text-white shadow hover:brightness-110 inline-flex items-center gap-1">
            <Plus className="mr-1 inline h-4 w-4" />
            Nova Proposta
          </Link>
        )}
      </div>

      <div className="text-xs opacity-60">{total.toLocaleString("pt-BR")} resultado(s)</div>
    </div>
  );
}
