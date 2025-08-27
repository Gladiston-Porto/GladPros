// src/modules/propostas/components/PropostasTable.tsx
"use client";
// removed unused useState
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
// UI table components not used in this file
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  FileText,
  Send,
  Copy
} from "lucide-react";
import type { PropostaDTO } from '../services/propostasApi';
import { useConfirm } from "@/components/ui/ConfirmDialog";

interface PropostasTableProps {
  data: PropostaDTO[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSend: (id: string) => void;
  sortKey: 'numeroProposta' | 'titulo' | 'cliente' | 'status' | 'valor' | 'criadoEm';
  sortDir: 'asc' | 'desc';
  onSort: (key: 'numeroProposta' | 'titulo' | 'cliente' | 'status' | 'valor' | 'criadoEm', dir: 'asc' | 'desc') => void;
}

const statusColors: Record<string, string> = {
  'RASCUNHO': 'bg-gray-100 text-gray-800',
  'ENVIADA': 'bg-blue-100 text-blue-800',
  'ASSINADA': 'bg-yellow-100 text-yellow-800',
  'APROVADA': 'bg-green-100 text-green-800',
  'CANCELADA': 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  'RASCUNHO': 'Rascunho',
  'ENVIADA': 'Enviada',
  'ASSINADA': 'Assinada', 
  'APROVADA': 'Aprovada',
  'CANCELADA': 'Cancelada',
};

export default function PropostasTable({
  data,
  loading,
  selectedIds,
  onSelectionChange,
  onDelete,
  onDuplicate,
  onSend,
  sortKey,
  sortDir,
  onSort
}: PropostasTableProps) {
  const { confirm, Dialog } = useConfirm();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(data.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSort = (key: 'numeroProposta' | 'titulo' | 'cliente' | 'status' | 'valor' | 'criadoEm') => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    onSort(key, newDir);
  };

  const handleDelete = async (proposta: PropostaDTO) => {
    const confirmed = await confirm({
      title: 'Deletar Proposta',
      message: `Tem certeza que deseja deletar a proposta "${proposta.numeroProposta}"?`,
      confirmText: 'Deletar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      onDelete(proposta.id);
    }
  };

  const formatCurrency = (value?: number) => {
    if (value == null) return 'N/A';
    return `USD ${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="py-12 text-center text-gray-400 text-sm">Carregando propostas...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="py-12 text-center text-gray-400 text-sm">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          Nenhuma proposta encontrada
        </div>
      </div>
    );
  }

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left opacity-70">
              <th className="px-3 py-2">
                <input
                  aria-label="Selecionar todos"
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('numeroProposta')}>
                Número {getSortIcon('numeroProposta')}
              </th>
              <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('titulo')}>
                Título {getSortIcon('titulo')}
              </th>
              <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('cliente')}>
                Cliente {getSortIcon('cliente')}
              </th>
              <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('status')}>
                Status {getSortIcon('status')}
              </th>
              <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('valor')}>
                Valor Cliente {getSortIcon('valor')}
              </th>
              <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('criadoEm')}>
                Criado Em {getSortIcon('criadoEm')}
              </th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((proposta) => (
              <tr key={proposta.id} className="border-t border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10">
                <td className="px-3 py-3">
                  <input
                    aria-label={`Selecionar ${proposta.numeroProposta}`}
                    type="checkbox"
                    checked={selectedIds.includes(proposta.id)}
                    onChange={(e) => handleSelectOne(proposta.id, e.target.checked)}
                  />
                </td>
                <td className="px-3 py-3 font-medium">
                  <Link 
                    href={`/propostas/${proposta.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {proposta.numeroProposta}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <div className="max-w-48 truncate" title={proposta.titulo}>
                    {proposta.titulo}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="max-w-40 truncate" title={proposta.cliente.nome}>
                    {proposta.cliente.nome}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge className={statusColors[proposta.status] || 'bg-gray-100 text-gray-800'}>
                    {statusLabels[proposta.status] || proposta.status}
                  </Badge>
                </td>
                <td className="px-3 py-3">{formatCurrency(proposta.precoPropostaCliente)}</td>
                <td className="px-3 py-3">{formatDate(proposta.criadoEm)}</td>
                <td className="px-3 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/propostas/${proposta.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      {proposta.status === 'RASCUNHO' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/propostas/${proposta.id}/editar`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDuplicate(proposta.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      {(proposta.status === 'RASCUNHO' || proposta.status === 'APROVADA') && (
                        <DropdownMenuItem onClick={() => onSend(proposta.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(proposta)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog />
    </>
  );
}
