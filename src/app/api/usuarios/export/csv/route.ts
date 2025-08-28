import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";

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
	id: number; email: string; nomeCompleto?: string | null; nome?: string | null;
	role?: string | null; nivel?: string | null; status?: string | null;
	telefone?: string | null; cidade?: string | null; estado?: string | null;
	cep?: string | null; zipcode?: string | null; criadoEm?: Date | null;
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

export async function POST(req: NextRequest) {
	// Proteção contra execução durante build time
	if (isBuildTime()) {
		return NextResponse.json(
			{ error: "Service temporarily unavailable" },
			{ status: 503 }
		);
	}

	try {
		const raw = await req.json().catch(() => ({}));
		const parsed = z.object({ filters: FiltersSchema }).safeParse(raw);
		if (!parsed.success) {
			return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
		}
		const f = parsed.data.filters ?? {};

		const where: string[] = [];
		const params: SqlValue[] = [];
		if (f.q) {
			const like = `%${f.q}%`;
			where.push("(email LIKE ? OR nomeCompleto LIKE ? OR nome LIKE ?)");
			params.push(like, like, like);
		}
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

		// CSV
		const headers = ["ID","Nome Completo","E-mail","Nível","Status","Criado Em"];
		const lines = [headers.join(",")];
		for (const r of rows) {
			const nome = r.nome ?? r.nomeCompleto ?? "";
			const nivel = r.role ?? r.nivel ?? "";
			const status = r.status ?? "";
			const criado = r.criadoEm ? new Date(r.criadoEm).toLocaleDateString('pt-BR') : "";
			const data = [r.id, nome, r.email, nivel, status, criado].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");
			lines.push(data);
		}
		const csv = lines.join("\n");
		return new NextResponse(csv, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': 'attachment; filename="usuarios.csv"',
			}
		});
	} catch (e) {
		console.error("/api/usuarios/export/csv error", e);
		return NextResponse.json({ message: "Erro interno" }, { status: 500 });
	}
}

