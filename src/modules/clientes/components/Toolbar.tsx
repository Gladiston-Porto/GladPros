// src/modules/clientes/components/Toolbar.tsx
"use client";
import { Search, Download, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ClienteDTO } from '@/types/cliente';
import { exportToCSV, exportToPDF, exportToCSVServer } from "../services/exportService";
import { needsExportWarning } from "../services/bulkService";
import { useToast } from "@/components/ui/Toaster";

interface ToolbarProps {
  q: string;
  onQ: (value: string) => void;
  tipo: string;
  onTipo: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  total: number;
  showNew?: boolean;
  clientes: ClienteDTO[];
  scope?: 'selected' | 'allFiltered';
  selectedCount?: number;
  onScopeChange?: (s: 'selected' | 'allFiltered') => void;
  loading?: boolean;
}

export default function Toolbar({
  q,
  onQ,
  tipo,
  onTipo,
  status,
  onStatus,
  total,
  showNew = true,
  clientes,
  scope = 'allFiltered',
  selectedCount = 0,
  onScopeChange,
  loading = false
}: ToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [tipoMenuOpen, setTipoMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const tipoRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf') => {
    setShowExportMenu(false);
    setExporting(true);

    // Determine scope
  const currentScope = scope || 'allFiltered';
  const count = currentScope === 'selected' ? (selectedCount || 0) : total;
    if (count === 0) {
      showToast({ title: 'Aviso', message: 'Nenhum cliente para exportar', type: 'info' });
      return;
    }
    if (needsExportWarning(count)) {
      const proceed = window.confirm(`Você está prestes a exportar ${count} registros. Isso pode demorar. Deseja continuar?`);
      if (!proceed) return;
    }

    try {
      if (format === 'csv') {
        if (currentScope === 'selected') {
          exportToCSV(clientes);
        } else {
          await exportToCSVServer({ filename: 'clientes', filters: { q, tipo: (tipo === '' ? 'all' : tipo), ativo: status === 'ATIVO' ? true : status === 'INATIVO' ? false : 'all' } });
        }
        showToast({ title: 'Exportado', message: 'CSV gerado com sucesso', type: 'success' });
      } else {
        if (currentScope === 'selected') {
          await exportToPDF(clientes);
        } else {
          // Server-side fetch by filters
          await fetch('/api/clientes/export/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: 'clientes', filters: { q, tipo: (tipo === '' ? 'all' : tipo), ativo: status === 'ATIVO' ? true : status === 'INATIVO' ? false : 'all' } })
          }).then(async (resp) => {
            if (!resp.ok) throw new Error('Falha ao exportar PDF');
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'clientes.pdf';
            a.click();
            URL.revokeObjectURL(url);
          });
        }
        showToast({ title: 'Exportado', message: 'PDF gerado com sucesso', type: 'success' });
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      showToast({ title: 'Erro', message: `Erro ao exportar ${format.toUpperCase()}`, type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (tipoRef.current && !tipoRef.current.contains(event.target as Node)) {
        setTipoMenuOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
      if (scopeRef.current && !scopeRef.current.contains(event.target as Node)) {
        setScopeMenuOpen(false);
      }
    };

    if (showExportMenu || tipoMenuOpen || statusMenuOpen || scopeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu, tipoMenuOpen, statusMenuOpen, scopeMenuOpen]);

  // Export helpers moved to service

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="w-[260px] rounded-xl border border-black/10 bg-white px-9 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-[#0098DA] dark:border-white/10 dark:bg-white/5 text-foreground"
          />
        </div>

        {/* Tipo (custom menu to respect dark background when open) */}
  <div className="relative" data-slot="tipo-menu" ref={tipoRef}>
          <button
            onClick={() => setTipoMenuOpen(v => !v)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 text-foreground"
            aria-haspopup="menu"
            aria-expanded={tipoMenuOpen}
          >
            {tipo === '' ? 'Todos os Tipos' : tipo}
            <span className="ml-2">▾</span>
          </button>
          {tipoMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 z-20">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onTipo(''); setTipoMenuOpen(false); }}>Todos os Tipos</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onTipo('PF'); setTipoMenuOpen(false); }}>Pessoa Física</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onTipo('PJ'); setTipoMenuOpen(false); }}>Pessoa Jurídica</button>
            </div>
          )}
        </div>

        {/* Status (custom menu) */}
  <div className="relative" data-slot="status-menu" ref={statusRef}>
          <button
            onClick={() => setStatusMenuOpen(v => !v)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 text-foreground"
            aria-haspopup="menu"
            aria-expanded={statusMenuOpen}
          >
            {status === '' ? 'Todos' : status === 'ATIVO' ? 'Status' : 'Inativos'}
            <span className="ml-2">▾</span>
          </button>
          {statusMenuOpen && (
            <div className="absolute left-0 top-full mt-1 w-40 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 z-20">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onStatus(''); setStatusMenuOpen(false); }}>Todos</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onStatus('ATIVO'); setStatusMenuOpen(false); }}>Ativos</button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onStatus('INATIVO'); setStatusMenuOpen(false); }}>Inativos</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onScopeChange && (
          <div className="relative" ref={scopeRef}>
            <button
              onClick={() => setScopeMenuOpen(v => !v)}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 text-foreground"
              aria-haspopup="menu"
              aria-expanded={scopeMenuOpen}
            >
              {'Selecionados'}
              <span className="ml-2">▾</span>
            </button>
            {scopeMenuOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 z-20">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onScopeChange('selected'); setScopeMenuOpen(false); }}>Selecionados</button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { onScopeChange('allFiltered'); setScopeMenuOpen(false); }}>Todos os filtrados</button>
              </div>
            )}
          </div>
        )}
        <div className="relative" ref={exportRef}>
          <button 
            onClick={() => !exporting && setShowExportMenu(!showExportMenu)}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5 dark:border-white/10 dark:bg-white/5 flex items-center gap-1 disabled:opacity-50"
            disabled={loading || exporting}
            aria-busy={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? 'Exportando' : 'Exportar'}
            {!exporting && <ChevronDown className="h-3 w-3" />}
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg flex items-center gap-2"
              >
                <span>📊</span>
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
              >
                <span>📄</span>
                <span>Exportar PDF</span>
              </button>
            </div>
          )}
        </div>
        {showNew && (
          <Link href="/clientes/novo" className="rounded-2xl bg-[#0098DA] px-4 py-2 text-sm text-white hover:brightness-110 inline-flex items-center gap-1">
            Novo Cliente
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {loading && <div className="text-xs opacity-70">Carregando…</div>}
        <div className="text-xs opacity-60">{total.toLocaleString("pt-BR")} resultado(s)</div>
      </div>
    </div>
  );
}
