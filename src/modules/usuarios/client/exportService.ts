// src/modules/usuarios/services/exportService.ts
import { Usuario } from "../types";

export const exportToCSV = (users: Usuario[], filename: string = 'usuarios') => {
  // Cabeçalhos da tabela
  const headers = [
    'ID',
    'Nome Completo', 
    'E-mail',
    'Nível',
    'Telefone',
    'Data Nascimento',
    'Cidade',
    'Estado',
    'CEP',
    'Status',
    'Criado Em'
  ];

  // Converter dados para CSV
  const csvData = users.map(user => [
    user.id,
    user.nomeCompleto || '',
    user.email,
    user.role || '',
    user.telefone || '',
    user.dataNascimento ? new Date(user.dataNascimento).toLocaleDateString('pt-BR') : '',
    user.cidade || '',
    user.estado || '',
    user.cep || '',
    user.ativo ? 'Ativo' : 'Inativo',
    user.criadoEm ? new Date(user.criadoEm).toLocaleDateString('pt-BR') : ''
  ]);

  // Criar conteúdo CSV
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Download do arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (users: Usuario[], filename: string = 'usuarios') => {
  // Usar API endpoint para gerar PDF no servidor
  try {
    const response = await fetch('/api/usuarios/export/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users, filename }),
    });

    if (!response.ok) {
      throw new Error('Erro na resposta do servidor');
    }

    // Download do PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  throw error instanceof Error ? error : new Error('Erro ao gerar PDF');
  }
};
