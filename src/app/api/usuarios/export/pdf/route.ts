import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";
import { exportUsersPdfSchema } from "@/lib/validation";
import { z } from "zod";
import { prisma } from "@/server/db";

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  // Nunca considerar build time durante testes
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      process.env.NEXT_PHASE === 'phase-static' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production')
    )
  );
}

type UserRow = {
  id: number; email: string; nomeCompleto?: string | null; nome?: string | null;
  role?: string | null; nivel?: string | null; status?: string | null; criadoEm?: Date | null;
};

type SqlValue = string | number | null | Date | boolean;

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  let last: unknown;
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise(r => setTimeout(r, delayMs)); }
  }
  throw last;
}

const FiltersSchema = z.object({
  q: z.string().optional(),
  role: z.enum(["ADMIN","GERENTE","USUARIO","FINANCEIRO","ESTOQUE","CLIENTE"]).optional(),
  status: z.enum(["ATIVO","INATIVO"]).optional(),
  sortKey: z.enum(["nome","email","role","ativo","criadoEm"]).optional(),
  sortDir: z.enum(["asc","desc"]).optional(),
}).optional();

export async function POST(request: NextRequest) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
  const raw = await request.json().catch(() => ({}));
  // Support either explicit users array or filters for all-filtered scope
  const parsedUsers = exportUsersPdfSchema.safeParse(raw);
  const parsedFilters = z.object({ filename: z.string().optional(), filters: FiltersSchema }).safeParse(raw);
  if (!parsedUsers.success && !parsedFilters.success) {
    return NextResponse.json({ message: "Payload inválido para exportação" }, { status: 400 });
  }
  const filename = (parsedUsers.success ? parsedUsers.data.filename : parsedFilters.success ? parsedFilters.data.filename : undefined) || 'usuarios';
  let users = parsedUsers.success ? parsedUsers.data.users : [];

  if (!parsedUsers.success && parsedFilters.success) {
    const f = parsedFilters.data.filters ?? {};
    const where: string[] = [];
    const params: SqlValue[] = [];
    if (f.q) { const like = `%${f.q}%`; where.push("(email LIKE ? OR nomeCompleto LIKE ? OR nome LIKE ?)"); params.push(like, like, like); }
    if (f.role) { where.push("(role = ? OR nivel = ?)"); params.push(f.role, f.role); }
    if (f.status) { where.push("status = ?"); params.push(f.status); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const orderKey = (() => {
      switch (f.sortKey) {
        case "nome": return "COALESCE(nomeCompleto, nome)";
        case "email": return "email";
        case "role": return "COALESCE(role, nivel)";
        case "ativo": return "status";
        case "criadoEm":
        default: return "criadoEm";
      }
    })();
    const orderDir = (f.sortDir && f.sortDir.toUpperCase() === "ASC") ? "ASC" : "DESC";
    const sql = `SELECT * FROM Usuario ${whereSql} ORDER BY ${orderKey} ${orderDir}`;
    const rows = (await withRetry(() => prisma.$queryRawUnsafe(sql, ...params))) as unknown as UserRow[];
    users = rows.map((r) => ({
      nomeCompleto: r.nome ?? r.nomeCompleto ?? '',
      email: r.email,
      role: r.role ?? r.nivel ?? undefined,
      ativo: (r.status ?? '') === 'ATIVO',
      criadoEm: r.criadoEm ?? undefined,
    }));
  }

    // Criar PDF
    const doc = new jsPDF();

    // Configuração do documento
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Relatório de Usuários', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 30);
    doc.text(`Total de usuários: ${users.length}`, 20, 35);

    // Cabeçalho da tabela
    let y = 50;
    const lineHeight = 6;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Nome', 20, y);
    doc.text('E-mail', 70, y);
    doc.text('Nível', 120, y);
    doc.text('Status', 150, y);
    doc.text('Criado', 170, y);
    
    y += lineHeight;
    doc.line(20, y, 190, y); // Linha separadora
    y += 3;

    // Dados dos usuários
    doc.setFont('helvetica', 'normal');
  users.forEach((user) => {
      if (y > 270) { // Nova página se necessário
        doc.addPage();
        y = 20;
      }

      const nome = (user.nomeCompleto || '').substring(0, 25);
      const email = (user.email || '').substring(0, 25);
      const nivel = user.role || '';
      const status = user.ativo ? 'Ativo' : 'Inativo';
      const criado = user.criadoEm ? new Date(user.criadoEm).toLocaleDateString('pt-BR') : '';

      doc.text(nome, 20, y);
      doc.text(email, 70, y);
      doc.text(nivel, 120, y);
      doc.text(status, 150, y);
      doc.text(criado, 170, y);
      
      y += lineHeight;
    });

    // Converter para buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Retornar PDF como resposta
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

