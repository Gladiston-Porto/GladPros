import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";
import { prisma } from "@/server/db";
import { clienteFiltersSchema } from "@/lib/validations/cliente";

type ClientePayload = {
  id: number;
  nomeCompletoOuRazao: string;
  email: string;
  tipo: 'PF' | 'PJ';
  telefone?: string | null;
  cidade?: string | null;
  estado?: string | null;
  ativo?: boolean;
  criadoEm?: string;
};

function buildWhere(filters: any) {
  const where: any = {};
  if (filters?.q && String(filters.q).trim()) {
    const searchTerm = String(filters.q).trim();
    where.OR = [
      { nomeCompleto: { contains: searchTerm, mode: 'insensitive' } },
      { razaoSocial: { contains: searchTerm, mode: 'insensitive' } },
      { nomeFantasia: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { docLast4: { contains: searchTerm } }
    ];
  }
  if (filters?.tipo && filters.tipo !== 'all') where.tipo = filters.tipo;
  if (filters?.ativo !== undefined && filters.ativo !== 'all') where.status = filters.ativo ? 'ATIVO' : 'INATIVO';
  return where;
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}));
    const filename = typeof raw?.filename === 'string' && raw.filename.trim() ? raw.filename : 'clientes';
    let clientes: ClientePayload[] = Array.isArray(raw?.clientes) ? raw.clientes : [];

    // If filters provided, fetch server-side
    if (!clientes.length && raw?.filters) {
      const parsed = clienteFiltersSchema.partial().parse(raw.filters);
      const where = buildWhere(parsed);
      const rows = await prisma.cliente.findMany({
        where,
        select: {
          id: true,
          tipo: true,
          nomeCompleto: true,
          razaoSocial: true,
          nomeFantasia: true,
          email: true,
          telefone: true,
          cidade: true,
          estado: true,
          status: true,
          criadoEm: true
        },
        orderBy: [{ status: 'desc' }, { atualizadoEm: 'desc' }]
      });
      clientes = rows.map(r => ({
        id: r.id,
        nomeCompletoOuRazao: r.tipo === 'PF' ? (r.nomeCompleto || '') : (r.nomeFantasia || r.razaoSocial || ''),
        email: r.email,
        tipo: r.tipo,
        telefone: r.telefone,
        cidade: r.cidade || undefined,
        estado: r.estado || undefined,
        ativo: r.status === 'ATIVO',
        criadoEm: r.criadoEm.toISOString()
      }));
    }

    if (!clientes.length) return NextResponse.json({ message: 'Nenhum cliente para exportar' }, { status: 400 });

    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Relatório de Clientes', 20, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 30);
    doc.text(`Total de clientes: ${clientes.length}`, 20, 35);

    let y = 50;
    const lineHeight = 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Nome/Empresa', 20, y);
    doc.text('Tipo', 80, y);
    doc.text('E-mail', 100, y);
    doc.text('Telefone', 150, y);
    doc.text('Status', 180, y);
    y += lineHeight;
    doc.line(20, y, 190, y);
    y += 3;

    doc.setFont('helvetica', 'normal');
    clientes.forEach((c) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const nome = (c.nomeCompletoOuRazao || '').substring(0, 40);
      const tipo = c.tipo || '';
      const email = (c.email || '').substring(0, 30);
      const tel = (c.telefone || '')?.substring(0, 18);
      const status = c.ativo ? 'Ativo' : 'Inativo';
      doc.text(nome, 20, y);
      doc.text(tipo, 80, y);
      doc.text(email, 100, y);
      doc.text(tel, 150, y);
      doc.text(status, 180, y);
      y += lineHeight;
    });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF de clientes:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
