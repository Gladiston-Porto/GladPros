// src/app/api/usuarios/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { generateTempPassword } from "../../../lib/passwords";
import { renderWelcomeEmail } from "@/lib/emails/welcome";
import { sendMail } from "@/lib/mailer";

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      process.env.NEXT_PHASE === 'phase-static' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined' ||
      process.env.NODE_ENV === 'development'
    )
  );
}

// Minimal shapes for raw SQL rows
type UserRow = {
  id: number;
  email: string;
  nomeCompleto?: string | null;
  nome?: string | null;
  role?: string | null;
  nivel?: string | null;
  status?: string | null;
  telefone?: string | null;
  endereco1?: string | null;
  endereco2?: string | null;
  cidade?: string | null;
  estado?: string | null;
  zipcode?: string | null;
  cep?: string | null;
  anotacoes?: string | null;
  ultimoLoginEm?: Date | null;
  criadoEm?: Date | null;
  atualizadoEm?: Date | null;
  avatarUrl?: string | null;
};

type CountRow = { cnt: number };
type ColumnRow = { COLUMN_NAME: string };
type SqlValue = string | number | null | Date | boolean;

// Retry helper for transient DB init (e.g., P1001 on container boot)
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const e = err as { code?: string; errorCode?: string; name?: string } | undefined;
      const code = e?.code || e?.errorCode;
      const name = e?.name;
      const isInit = name === "PrismaClientInitializationError" || code === "P1001";
      if (!isInit || i === retries) throw err;
      lastErr = err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

/** Enums alinhados ao Prisma (note: Prisma model uses 'nivel' e 'StatusUsuario') */
const Roles = z.enum(["ADMIN", "GERENTE", "USUARIO", "FINANCEIRO", "ESTOQUE", "CLIENTE"]);
const Status = z.enum(["ATIVO", "INATIVO"]);

/* =========================================================
 * GET /api/usuarios
 * Lista com paginação e filtros: q, role, status, page, pageSize
 * =======================================================*/
export async function GET(req: Request) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    // validação leve dos params
    const querySchema = z.object({
      q: z.string().optional(),
      role: Roles.optional(),
      status: Status.optional(),
      sortKey: z.enum(["nome","email","role","ativo","criadoEm"]).optional(),
      sortDir: z.enum(["asc","desc"]).optional(),
      page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 1))
        .refine((v) => !isNaN(v as number) && (v as number) >= 1, "page inválida"),
      pageSize: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 20))
        .refine((v) => !isNaN(v as number) && (v as number) >= 1 && (v as number) <= 100, "pageSize inválido"),
    });

    const parsed = querySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
  role: searchParams.get("role") ?? undefined,
  status: searchParams.get("status") ?? undefined,
  sortKey: searchParams.get("sortKey") ?? undefined,
  sortDir: searchParams.get("sortDir") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_QUERY", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { page, pageSize, q: qq, role, status, sortKey, sortDir } = parsed.data;
    const skip = (page - 1) * pageSize;

    // Build WHERE
    const where: string[] = [];
    const params: SqlValue[] = [];
    if (qq) {
      where.push("(email LIKE ? OR nomeCompleto LIKE ? OR nome LIKE ?)");
      const like = `%${qq}%`;
      params.push(like, like, like);
    }
    if (role) {
      // either role or nivel
      where.push("(role = ? OR nivel = ?)");
      params.push(role, role);
    }
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // ORDER BY mapping
    const orderKey = (() => {
      switch (sortKey) {
        case "nome": return "COALESCE(nomeCompleto, nome)";
        case "email": return "email";
        case "role": return "COALESCE(role, nivel)";
        case "ativo": return "status";
        case "criadoEm":
        default: return "criadoEm";
      }
    })();
    const orderDir = (sortDir && sortDir.toUpperCase() === "ASC") ? "ASC" : "DESC";

    // Query items
    const itemsSql = `SELECT * FROM Usuario ${whereSql} ORDER BY ${orderKey} ${orderDir} LIMIT ? OFFSET ?`;
    const itemsParams = [...params, pageSize, skip];
    const itemsRaw = (await withRetry(() => prisma.$queryRawUnsafe(itemsSql, ...itemsParams))) as unknown as UserRow[];

    // Count
    const countSql = `SELECT COUNT(*) as cnt FROM Usuario ${whereSql}`;
    const countRaw = (await withRetry(() => prisma.$queryRawUnsafe(countSql, ...params))) as unknown as CountRow[];
    const total = Number(countRaw?.[0]?.cnt ?? 0);

    // normalize to a common shape by checking likely field names
    const normalized = itemsRaw.map((it) => {
      const nome = it.nome ?? it.nomeCompleto ?? null;
      const roleVal = it.role ?? it.nivel ?? null;
      const cepVal = it.zipcode ?? it.cep ?? null;
      return {
        id: it.id,
        email: it.email,
        nomeCompleto: nome ?? it.email,
        role: roleVal,
        status: it.status ?? null,
        telefone: it.telefone ?? null,
        endereco1: it.endereco1 ?? null,
        endereco2: it.endereco2 ?? null,
        cidade: it.cidade ?? null,
        estado: it.estado ?? null,
        cep: cepVal,
        anotacoes: it.anotacoes ?? null,
        ultimoLoginEm: it.ultimoLoginEm ?? null,
        criadoEm: it.criadoEm ?? null,
        atualizadoEm: it.atualizadoEm ?? null,
        avatarUrl: it.avatarUrl ?? null,
      };
    });

    return NextResponse.json({ items: normalized, total, page, pageSize }, { status: 200 });
  } catch (err) {
    console.error("GET /api/usuarios error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR", message: "Erro interno do servidor" }, { status: 500 });
  }
}

/* =========================================================
 * POST /api/usuarios
 * Cria usuário SEM senha no formulário:
 *  - gera senha provisória
 *  - mustResetPassword = true
 *  - envia e-mail de boas-vindas
 * =======================================================*/
const EstadosMax = z.string().max(32);

// Adapted to the current Prisma schema (required fields are different).
const UserCreateSchema = z.object({
  email: z.string().email(),
  // application-level fields are accepted but many are optional in schema
  nomeCompleto: z.string().optional(),
  role: Roles.optional(),
  status: Status.optional(),
  telefone: z.string().max(32).optional().or(z.literal(""))
    .transform((s) => s || undefined)
    .refine((v) => {
      if (!v) return true; // opcional é válido
      // Remove todos os caracteres não numéricos para validação
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }, {
      message: "Telefone deve ter entre 10 e 11 dígitos. Exemplo: (11)99999-9999"
    }),
  dataNascimento: z
    .union([z.string(), z.date()])
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      if (v instanceof Date) {
        if (isNaN(v.getTime())) return undefined;
        const yyyy = v.getFullYear();
        const mm = String(v.getMonth() + 1).padStart(2, "0");
        const dd = String(v.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
      const s = String(v).trim();
      // Accept 'YYYY-MM-DD' format
      const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (mIso) return s;
      
      // Accept MM/DD/YYYY format (US standard - original format)
      const mUs = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mUs) {
        const [, mm, dd, yyyy] = mUs as unknown as [string, string, string, string];
        const dayNum = parseInt(dd, 10);
        const monthNum = parseInt(mm, 10);
        
        // Validate day and month ranges
        if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
          return "INVALID_DATE"; // Return special value instead of throwing
        }
        
        const ddPad = dd.padStart(2, "0");
        const mmPad = mm.padStart(2, "0");
        return `${yyyy}-${mmPad}-${ddPad}`;
      }
      
      return "INVALID_DATE"; // Return special value instead of throwing
    })
    .refine((dateStr) => {
      if (!dateStr) return true; // opcional é válido
      if (dateStr === "INVALID_DATE") return false; // data inválida
      // Validação adicional: tentar criar Date para verificar se é uma data real
      const date = new Date(dateStr + 'T00:00:00.000Z');
      return !isNaN(date.getTime());
    }, {
      message: "Data de nascimento inválida. Use o formato MM/DD/YYYY (ex: 05/18/1979)"
    }),
  endereco1: z.string().max(191).optional().or(z.literal("")).transform((s) => s || undefined),
  endereco2: z.string().max(191).optional().or(z.literal("")).transform((s) => s || undefined),
  cidade: z.string().max(96).optional().or(z.literal("")).transform((s) => s || undefined),
  estado: EstadosMax.optional().or(z.literal("")).transform((s) => s || undefined),
  cep: z.string().max(16).optional().or(z.literal(""))
    .transform((s) => s || undefined)
    .refine((v) => {
      if (!v) return true; // opcional é válido
      // Remove caracteres não numéricos para validação
      const digits = v.replace(/\D/g, "");
      // CEP brasileiro tem 8 dígitos, mas permitir flexibilidade (5-9 dígitos)
      return digits.length >= 5 && digits.length <= 9 && digits === v.replace(/\D/g, "");
    }, {
      message: "CEP deve conter apenas números. Exemplo: 01234567"
    }),
  anotacoes: z.string().optional().or(z.literal(""))
    .transform((s) => (s && s.trim().length > 0 ? s : undefined)),
});

export async function POST(req: Request) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_BODY", message: "JSON inválido" }, { status: 400 });
  }

  const parsed = UserCreateSchema.safeParse(body);
  if (!parsed.success) {
    // Processar erros específicos para mensagens mais claras
    const errors = parsed.error.issues;
    const fieldErrors: Record<string, string> = {};
    
    for (const error of errors) {
      const field = error.path[0] as string;
      if (error.message.includes("INVALID_DATE_FORMAT") || error.message.includes("Data de nascimento inválida")) {
        fieldErrors[field] = "Data de nascimento inválida. Use o formato MM/DD/YYYY (exemplo: 05/18/1979)";
      } else if (field === "telefone" && error.message.includes("10 e 11 dígitos")) {
        fieldErrors[field] = "Telefone deve ter entre 10 e 11 dígitos. Exemplo: (11)99999-9999";
      } else if (field === "cep" && error.message.includes("apenas números")) {
        fieldErrors[field] = "CEP deve conter apenas números. Exemplo: 01234567";
      } else if (field === "email") {
        fieldErrors[field] = "E-mail inválido";
      } else {
        fieldErrors[field] = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: "VALIDATION_ERROR", 
        message: "Dados inválidos. Verifique os campos destacados.",
        fields: fieldErrors,
        issues: parsed.error.flatten() // manter para debug se necessário
      },
      { status: 400 }
    );
  }

  const { email: emailAddr, nomeCompleto, role, status, telefone, dataNascimento, endereco1, endereco2, cidade, estado, cep, anotacoes } = parsed.data;

  try {
    // Checagem por e-mail via SQL bruto (evita schema/stale do Prisma Client)
  const existsRows = (await withRetry(() => prisma.$queryRaw`
      SELECT id FROM Usuario WHERE email = ${emailAddr} LIMIT 1
  `)) as unknown as Array<{ id: number }>;
    const exists = existsRows.length > 0;
    if (exists) {
      return NextResponse.json({ error: "EMAIL_TAKEN", message: "E-mail já cadastrado" }, { status: 409 });
    }

    // 1) gerar senha provisória
    const tempPassword = generateTempPassword(12);
    const senhaHash = await bcrypt.hash(tempPassword, 10);

    // 2) Inserção resiliente ao schema: detectar colunas disponíveis
    const colsRows = (await withRetry(() => prisma.$queryRaw`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Usuario'
      `)) as unknown as ColumnRow[];
      const cols = new Set(colsRows.map((r) => String(r.COLUMN_NAME)));

      const insertCols: string[] = ["email", "senha"]; // essenciais
      const values: SqlValue[] = [emailAddr, senhaHash];

    // status
    if (cols.has("status")) { insertCols.push("status"); values.push(status ?? "ATIVO"); }

    // role/nivel
    if (cols.has("nivel")) { insertCols.push("nivel"); values.push(role ?? "USUARIO"); }
    else if (cols.has("role")) { insertCols.push("role"); values.push(role ?? "USUARIO"); }

    // nome
    if (cols.has("nomeCompleto")) { insertCols.push("nomeCompleto"); values.push(nomeCompleto ?? null); }
    else if (cols.has("nome")) { insertCols.push("nome"); values.push(nomeCompleto ?? null); }

    // outros campos opcionais
    if (cols.has("telefone")) { insertCols.push("telefone"); values.push(telefone ?? null); }
    if (cols.has("dataNascimento")) { insertCols.push("dataNascimento"); values.push(dataNascimento ?? null); }
    if (cols.has("endereco1")) { insertCols.push("endereco1"); values.push(endereco1 ?? ""); }
    if (cols.has("endereco2")) { insertCols.push("endereco2"); values.push(endereco2 ?? ""); }
    if (cols.has("cidade")) { insertCols.push("cidade"); values.push(cidade ?? ""); }
    if (cols.has("estado")) { insertCols.push("estado"); values.push(estado ?? null); }
  if (cols.has("zipcode")) { insertCols.push("zipcode"); values.push(cep ?? null); }
    else if (cols.has("cep")) { insertCols.push("cep"); values.push(cep ?? null); }
  if (cols.has("anotacoes")) { insertCols.push("anotacoes"); values.push(anotacoes ?? null); }
    
    // Campos para controle de primeiro acesso e senha provisória
    if (cols.has("primeiroAcesso")) { insertCols.push("primeiroAcesso"); values.push(true); }
    if (cols.has("senhaProvisoria")) { insertCols.push("senhaProvisoria"); values.push(true); }
    
    if (cols.has("criadoEm")) { insertCols.push("criadoEm"); values.push(new Date()); }
    if (cols.has("atualizadoEm")) { insertCols.push("atualizadoEm"); values.push(new Date()); }

    const placeholders = insertCols.map(() => "?").join(", ");
    const columnList = insertCols.map((c) => `\`${c}\``).join(", ");
    const sql = `INSERT INTO Usuario (${columnList}) VALUES (${placeholders})`;
    await withRetry(() => prisma.$executeRawUnsafe(sql, ...values));

  const createdRows = (await withRetry(() => prisma.$queryRaw`
      SELECT id, email, status, criadoEm FROM Usuario WHERE email = ${emailAddr} LIMIT 1
  `)) as unknown as Array<{ id: number; email: string; status: string; criadoEm: Date }>;
    const created = createdRows[0];

    // 3) e-mail de boas-vindas (include temp password)
    const appUrl: string = process.env.APP_URL ?? "http://localhost:3000";
    const assetsBaseUrl: string = process.env.ASSETS_BASE_URL ?? "";
    const supportEmail: string = process.env.SUPPORT_EMAIL ?? "suporte@gladpros.com";

    const displayName = nomeCompleto ?? created.email;
  const { subject, html /*, text*/ } = renderWelcomeEmail({
      name: displayName,
      email: created.email,
      tempPassword,
      appUrl,
      assetsBaseUrl,
      supportEmail,
    });

    try {
      // Ajuste a chamada conforme a assinatura real do seu sendMail.
      // Se sendMail(to, subject, html) é a assinatura:
      await sendMail(created.email, subject, html);

      // Se sua sendMail aceita texto também, use:
      // await sendMail(email, subject, html, text);

      // Se realmente tiver uma versão que aceita um objeto, ignore esta nota.
    } catch (err) {
      console.warn("[SMTP MAILER ERROR]", err);
      // não bloquear criação do usuário; opcional: adicionar _mailWarning no retorno
    }

  // Inclusão de metadados sem quebrar clientes: mantém campos do usuário no topo
  return NextResponse.json({ ok: true, message: "Usuário criado com sucesso", ...created }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/usuarios error:", err);
    
    // Tratar erros específicos do banco de dados
    const e = err as { message?: string; code?: string } | undefined;
    const errorMessage = e?.message || String(err);
    const errorCode = e?.code;
    
    // Erro de data inválida do MySQL/MariaDB
    if (errorCode === "P2010" && errorMessage.includes("Incorrect date value")) {
      return NextResponse.json({
        error: "VALIDATION_ERROR",
        message: "Data de nascimento inválida. Use o formato MM/DD/YYYY (exemplo: 05/18/1979)",
        fields: {
          dataNascimento: "Data de nascimento inválida. Use o formato MM/DD/YYYY (exemplo: 05/18/1979)"
        }
      }, { status: 400 });
    }
    
    // Erro de constraint de telefone (se houver)
    if (errorMessage.toLowerCase().includes("telefone")) {
      return NextResponse.json({
        error: "VALIDATION_ERROR",
        message: "Telefone inválido. Deve ter entre 10 e 11 dígitos.",
        fields: {
          telefone: "Telefone deve ter entre 10 e 11 dígitos. Exemplo: (11)99999-9999"
        }
      }, { status: 400 });
    }
    
    // Erro de CEP inválido
    if (errorMessage.toLowerCase().includes("cep")) {
      return NextResponse.json({
        error: "VALIDATION_ERROR",
        message: "CEP inválido. Deve conter apenas números.",
        fields: {
          cep: "CEP deve conter apenas números. Exemplo: 01234567"
        }
      }, { status: 400 });
    }
    
    // Erro genérico
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      message: "Erro interno do servidor. Verifique os dados e tente novamente." 
    }, { status: 500 });
  }
}
