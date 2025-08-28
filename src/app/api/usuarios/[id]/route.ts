// src/app/api/usuarios/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";
import { AuditoriaService } from "@/lib/auditoria";
import { userUpdateApiSchema } from "@/lib/validation";

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined'
    )
  );
}

type UserRow = {
  id: number;
  email: string;
  nomeCompleto?: string | null;
  nome?: string | null;
  role?: string | null;
  nivel?: string | null;
  status?: string | null;
  telefone?: string | null;
  celular?: string | null;
  telefone1?: string | null;
  phone?: string | null;
  dataNascimento?: Date | string | null;
  nascimento?: Date | string | null;
  data_nascimento?: Date | string | null;
  birthdate?: Date | string | null;
  dob?: Date | string | null;
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

/* helper para suportar context.params Promise (Next 15 HMR) */
async function resolveParams(context: unknown) {
  const c = context as { params?: unknown };
  const maybe = (c?.params ?? c) as unknown;
  const isPromise = typeof (maybe as { then?: unknown })?.then === "function";
  const params = isPromise ? await (maybe as Promise<unknown>) : maybe;
  return (params as Record<string, unknown>) ?? {};
}

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

/* GET /api/usuarios/:id */
export async function GET(_req: Request, context: unknown) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  try {
    const params = await resolveParams(context);
    const idVal = (params as Record<string, unknown>)?.id;
    const id = Number(idVal);
    if (!id) return NextResponse.json({ code: "INVALID_ID" }, { status: 400 });

    const rows = (await withRetry(() => prisma.$queryRaw`SELECT * FROM Usuario WHERE id = ${id} LIMIT 1`)) as unknown as UserRow[];
    const found = rows[0];
    if (!found) return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });

    // normalizar para o frontend (campos esperados pelo form/serviço)
    let dobStr: string | null = null;
    const rawDob =
      found.dataNascimento ??
      found.nascimento ??
      found.data_nascimento ??
      found.birthdate ??
      found.dob ??
      null;
    if (rawDob instanceof Date) {
      const yyyy = rawDob.getUTCFullYear();
      const mm = String(rawDob.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(rawDob.getUTCDate()).padStart(2, "0");
      dobStr = `${mm}/${dd}/${yyyy}`;
    } else if (typeof rawDob === "string") {
      // suporta 'YYYY-MM-DD' e variantes com hora ('YYYY-MM-DD HH:mm:ss' ou ISO)
      const s10 = rawDob.slice(0, 10);
      const m = s10.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        const [, y, m2, d2] = m;
        dobStr = `${m2}/${d2}/${y}`;
      }
    }

    const nomeCalc = found.nomeCompleto ?? found.nome ?? (found as unknown as { nome_completo?: string })?.nome_completo ?? (found as unknown as { full_name?: string })?.full_name ?? null;
    const normalized = {
      id: found.id,
      email: found.email,
      nomeCompleto: nomeCalc && String(nomeCalc).trim().length > 0 ? String(nomeCalc) : found.email,
      role: found.role ?? found.nivel ?? null,
      status: found.status ?? null,
      telefone: found.telefone ?? found.celular ?? found.telefone1 ?? found.phone ?? null,
      dataNascimento: dobStr,
      endereco1: found.endereco1 ?? null,
      endereco2: found.endereco2 ?? null,
      cidade: found.cidade ?? null,
      estado: found.estado ?? null,
      cep: found.zipcode ?? found.cep ?? null,
      anotacoes: found.anotacoes ?? null,
      ultimoLoginEm: found.ultimoLoginEm ?? null,
      criadoEm: found.criadoEm ?? null,
      atualizadoEm: found.atualizadoEm ?? null,
      avatarUrl: found.avatarUrl ?? null,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    console.error("GET /api/usuarios/[id] error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

/* PATCH /api/usuarios/:id - parcial */
export async function PATCH(req: Request, context: unknown) {
  try {
    const params = await resolveParams(context);
  const idVal = (params as Record<string, unknown>)?.id;
  const id = Number(idVal);
    if (!id) return NextResponse.json({ code: "INVALID_ID" }, { status: 400 });

  const raw = await req.json().catch(() => ({}));
  const parsed = userUpdateApiSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    const fieldErrors: Record<string, string> = {};
    for (const issue of issues) {
      const field = (issue.path[0] as string) || 'general';
      fieldErrors[field] = issue.message;
    }
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Dados inválidos. Verifique os campos.",
        fields: fieldErrors,
      },
      { status: 400 }
    );
  }
  const body = parsed.data as Record<string, unknown>;
    // Detectar colunas reais do schema para mapear campos dinamicamente
  const colsRows = (await prisma.$queryRaw`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Usuario'
  `) as unknown as Array<{ COLUMN_NAME: string }>;
  const cols = new Set(colsRows.map((r) => String(r.COLUMN_NAME)));

    const allowed = [
      "email",
      "nomeCompleto",
      "telefone",
      "dataNascimento",
      "endereco1",
      "endereco2",
      "cidade",
      "estado",
      "zipcode",
      "cep",
      "role",
      "nivel",
      "status",
      "senha",
      "avatarUrl",
      "anotacoes",
    ] as const;

    const sets: string[] = [];
  const paramsVals: Array<string | number | null> = [];

    for (const key of allowed) {
      const raw = (body as Record<string, unknown>)[key];
      if (Object.prototype.hasOwnProperty.call(body, key) && raw !== undefined && raw !== null) {
        // ignorar strings vazias para não apagar dados sem intenção
        if (typeof raw === "string" && raw.trim() === "") continue;
        if (key === "senha") {
          const hash = await bcrypt.hash(String(raw), 10);
          sets.push(`senha = ?`);
          paramsVals.push(hash);
        } else if (key === "cep" && !(body as Record<string, unknown>)["zipcode"]) {
          // normalize cep -> zipcode or cep, conforme schema
          const target = cols.has("zipcode") ? "zipcode" : cols.has("cep") ? "cep" : null;
          if (target) {
            sets.push(`${target} = ?`);
            paramsVals.push(String(raw));
          }
        } else if (key === "nomeCompleto") {
          const target = cols.has("nomeCompleto") ? "nomeCompleto" : cols.has("nome") ? "nome" : null;
          if (target) {
            sets.push(`${target} = ?`);
            paramsVals.push(String(raw));
          }
        } else if (key === "dataNascimento") {
          // Accept 'YYYY-MM-DD' or 'MM/DD/YYYY'; store as 'YYYY-MM-DD'
          const v = String(raw).trim();
          let iso: string | null = null;
          const mIso = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          const mUs = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (mIso) {
            iso = v;
          } else if (mUs) {
            const [, mm, dd, yyyy] = mUs;
            iso = `${yyyy}-${mm}-${dd}`;
          }
          const dobCol = cols.has("dataNascimento")
            ? "dataNascimento"
            : cols.has("nascimento")
            ? "nascimento"
            : cols.has("data_nascimento")
            ? "data_nascimento"
            : cols.has("dob")
            ? "dob"
            : null;
          if (dobCol) {
            sets.push(`${dobCol} = ?`);
            paramsVals.push(iso);
          }
        } else {
          // map API keys to DB columns
          let column = key;
          if (key === "nivel" || key === "role") column = cols.has("nivel") ? "nivel" : cols.has("role") ? "role" : key;
          if (key === "zipcode") column = cols.has("zipcode") ? "zipcode" : cols.has("cep") ? "cep" : key;
          if (cols.has(column)) {
            // telefone: manter apenas dígitos ao salvar, se desejar limpar
            const val = column === "telefone" && typeof raw === "string"
              ? String(raw).replace(/\D/g, "")
              : (raw as string | number);
            sets.push(`${column} = ?`);
            paramsVals.push(val);
          }
        }
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ ok: true, message: "NO_CHANGES" });
    }

    // Capturar dados antes da atualização para auditoria
  const dadosAntes = (await withRetry(() => prisma.$queryRaw`SELECT * FROM Usuario WHERE id = ${id} LIMIT 1`)) as unknown as UserRow[];
  const usuarioAntes = dadosAntes[0];

    // adicionar atualizadoEm
    const sql = `UPDATE Usuario SET ${sets.join(", ")}, atualizadoEm = NOW() WHERE id = ?`;
    paramsVals.push(id);

    await withRetry(() => prisma.$executeRawUnsafe(sql, ...paramsVals));

    // Capturar dados depois da atualização para auditoria
  const dadosDepois = (await withRetry(() => prisma.$queryRaw`SELECT * FROM Usuario WHERE id = ${id} LIMIT 1`)) as unknown as UserRow[];
  const usuarioDepois = dadosDepois[0];

    // Registrar auditoria (não deve quebrar o fluxo se falhar)
    try {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      await AuditoriaService.registrarAtualizacaoUsuario(
        id,
        usuarioAntes,
        usuarioDepois,
        undefined, // TODO: pegar ID do usuário logado do token JWT
        ip
      );
    } catch (error) {
      console.error("Erro ao registrar auditoria:", error);
      // Não quebra o fluxo principal
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("PATCH /api/usuarios/[id] error:", err);
    
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

/* PUT /api/usuarios/:id - substitui (opcional) */
export async function PUT(req: Request, context: unknown) {
  // reutiliza a mesma lógica do PATCH para segurança simples
  return PATCH(req, context);
}

/* DELETE /api/usuarios/:id */
export async function DELETE(_req: Request, context: unknown) {
  try {
    const params = await resolveParams(context);
    const idVal = (params as Record<string, unknown>)?.id;
    const id = Number(idVal);
    if (!id) return NextResponse.json({ code: "INVALID_ID" }, { status: 400 });

    await withRetry(() => prisma.$executeRawUnsafe("DELETE FROM Usuario WHERE id = ?", id));
    // prisma.$executeRawUnsafe costuma retornar OkPacket em MySQL; assumir sucesso se sem exceção
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("DELETE /api/usuarios/[id] error:", err);
    // detectar FK violation (MySQL error code 1451) pode ser útil
    const e = err as { code?: string; errno?: number } | undefined;
    if (e?.code === "ER_ROW_IS_REFERENCED_2" || e?.errno === 1451) {
      return NextResponse.json({ error: "FOREIGN_KEY_CONSTRAINT" }, { status: 409 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
