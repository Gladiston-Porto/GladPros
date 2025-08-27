// src/modules/clientes/services/exportService.ts
import type { ClienteDTO } from "@/types/cliente";

export const exportToCSV = (clientes: ClienteDTO[], filename: string = 'clientes') => {
  const headers = [
    'ID',
    'Nome/Empresa',
    'Tipo',
    'E-mail',
    'Telefone',
    'Cidade',
    'Estado',
    'Status',
    'Criado Em',
  ];

  const rows = clientes.map((c) => [
    c.id,
    c.nomeCompletoOuRazao || '',
    c.tipo || '',
    c.email || '',
    c.telefone || '',
    c.cidade || '',
    c.estado || '',
    c.ativo ? 'Ativo' : 'Inativo',
    c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportToCSVServer = async (opts: { filename?: string; filters?: Record<string, unknown> | undefined; clientes?: ClienteDTO[] }) => {
  const res = await fetch('/api/clientes/export/csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err?.message ? new Error(err.message) : new Error('Falha ao gerar CSV');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${opts.filename || 'clientes'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (clientes: ClienteDTO[], filename: string = 'clientes') => {
  try {
    const res = await fetch('/api/clientes/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientes, filename }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw err?.message ? new Error(err.message) : new Error('Falha ao gerar PDF');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    throw e;
  }
};
