// File: src/modules/usuarios/services/usersApi.ts
import type { Usuario } from "../types";

const API = "/api/usuarios";

/** Constrói querystring ignorando valores vazios/undefined/null */
function buildQuery(params?: Record<string, string | number | boolean | null | undefined>) {
  const q = new URLSearchParams();
  if (!params) return "";
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  return q.toString();
}

/** Tenta parsear JSON; se falhar, retorna null */
async function safeJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Remove chaves com string vazia/undefined/null */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

/** Normaliza dataNascimento: aceita Date ou 'YYYY-MM-DD' */
function normalizeBirthdate(v?: string | Date) {
  if (!v) return undefined;
  if (v instanceof Date && !isNaN(v.getTime())) {
    const yyyy = v.getFullYear();
    const mm = String(v.getMonth() + 1).padStart(2, "0");
    const dd = String(v.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  // assume string 'YYYY-MM-DD' válida; API fará a validação final
  return v;
}

/* =========================================================
 * LISTAGEM
 * =======================================================*/
export async function getUsers(params?: {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortKey?: "nome" | "email" | "role" | "ativo" | "criadoEm";
  sortDir?: "asc" | "desc";
}) {
  const query = buildQuery(params);
  const url = query ? `${API}?${query}` : API;
  const res = await fetch(url, { cache: "no-store", credentials: "include" });

  if (!res.ok) {
    const body = await safeJson(res);
    const b = body as { error?: string; message?: string } | null;
    throw new Error(b?.error || b?.message || `HTTP ${res.status}`);
  }

  const body = await res.json();
  return {
    items: body.items ?? [],
    total: body.total ?? 0,
    page: body.page ?? 1,
    pageSize: body.pageSize ?? 20,
  } as {
    items: Usuario[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/* =========================================================
 * CRIAÇÃO
 *  - Mapeia os campos esperados pela API
 *  - Inclui TELEFONE (novo)
 * =======================================================*/
export type CreateUserInput = Partial<Usuario> & {
  dataNascimento?: string | Date;
};

export async function createUser(input: CreateUserInput) {
  const payload = compact({
    nomeCompleto: input.nomeCompleto,
    email: input.email,
    dataNascimento: normalizeBirthdate(input.dataNascimento),
    role: input.role ?? "USUARIO",
    status: input.status ?? "ATIVO",

    // ====== NOVO: TELEFONE ======
    telefone: input.telefone,

    endereco1: input.endereco1,
    endereco2: input.endereco2,
    cidade: input.cidade,
    estado: input.estado,
    cep: input.cep,
    anotacoes: input.anotacoes,
  });

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = await safeJson(res);
  if (!res.ok) {
    // Se é um erro de validação com campos específicos, manter essa estrutura
    const b = body as { error?: string; message?: string; fields?: Record<string, string> } | null;
    if (b?.error === "VALIDATION_ERROR" && b?.fields) {
      const err = new Error(b.message || "Erro de validação") as Error & {
        fields?: Record<string, string>;
      };
      err.fields = b.fields; // Adicionar os campos com erros
      throw err;
    }
    // Outros erros
    const m = (body as { error?: string; message?: string } | null);
    throw new Error(m?.error || m?.message || `HTTP ${res.status}`);
  }
  return body as Usuario;
}

/* =========================================================
 * DETALHE
 * =======================================================*/
export async function getUser(id: number | string) {
  const res = await fetch(`${API}/${id}`, { cache: "no-store", credentials: "include" });
  if (!res.ok) {
    const body = await safeJson(res);
    const b = body as { error?: string; message?: string } | null;
    throw new Error(b?.error || b?.message || `HTTP ${res.status}`);
  }
  return (await res.json()) as Usuario;
}

/* =========================================================
 * ATUALIZAÇÃO
 *  - Mantém PATCH (compatível com seu código atual)
 *  - Inclui TELEFONE (novo)
 * =======================================================*/
export type UpdateUserInput = Partial<Usuario> & {
  dataNascimento?: string | Date;
};

export async function updateUser(id: number | string, input: UpdateUserInput) {
  const payload = compact({
    nomeCompleto: input.nomeCompleto,
    email: input.email,
    dataNascimento: normalizeBirthdate(input.dataNascimento),
    role: input.role,
    status: input.status,

    // ====== NOVO: TELEFONE ======
    telefone: input.telefone,

    endereco1: input.endereco1,
    endereco2: input.endereco2,
    cidade: input.cidade,
    estado: input.estado,
    cep: input.cep,
    anotacoes: input.anotacoes,
  });

  const res = await fetch(`${API}/${id}`, {
    method: "PATCH", // mantém PATCH conforme seu código
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = await safeJson(res);
  if (!res.ok) {
    // Se é um erro de validação com campos específicos, manter essa estrutura
    const b = body as { error?: string; message?: string; fields?: Record<string, string> } | null;
    if (b?.error === "VALIDATION_ERROR" && b?.fields) {
      const err = new Error(b.message || "Erro de validação") as Error & {
        fields?: Record<string, string>;
      };
      err.fields = b.fields; // Adicionar os campos com erros
      throw err;
    }
    // Outros erros
    const m = (body as { error?: string; message?: string } | null);
    throw new Error(m?.error || m?.message || `HTTP ${res.status}`);
  }
  return body as Usuario;
}

/* =========================================================
 * EXCLUSÃO
 * =======================================================*/
export async function deleteUser(id: number | string) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
  const body = await safeJson(res);
  if (!res.ok) {
    const b = body as { error?: string; message?: string } | null;
    throw new Error(b?.error || b?.message || `HTTP ${res.status}`);
  }
  return body;
}

/* =========================================================
 * ALTERAR STATUS
 * =======================================================*/
export async function toggleUserStatus(id: number | string, ativo: boolean) {
  const res = await fetch(`${API}/${id}/status`, { 
    method: "PATCH", 
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo })
  });
  const body = await safeJson(res);
  if (!res.ok) {
    const b = body as { error?: string; message?: string } | null;
    throw new Error(b?.error || b?.message || `HTTP ${res.status}`);
  }
  return body;
}
