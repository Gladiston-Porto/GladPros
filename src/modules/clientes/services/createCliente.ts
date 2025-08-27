import { prisma } from "@/server/db"
import { encryptDoc, docHashHex, last4 } from "@/lib/crypto"

export type Input = {
  tipo: "PF" | "PJ"
  nomeCompleto?: string
  razaoSocial?: string
  nomeFantasia?: string
  email: string
  telefone: string
  endereco1?: string
  endereco2?: string
  cidade?: string
  estado?: string
  zipcode?: string
  documento?: string
  observacoes?: string
  status?: "ATIVO" | "INATIVO"
}

function normalizePhone(phone?: string) {
  return (phone ?? "").replace(/\D+/g, "") // só dígitos
}
function normalizeName(name?: string) {
  return (name ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim()
}
function buildNomeChave(
  tipo: "PF" | "PJ",
  nomeCompleto?: string,
  razaoSocial?: string,
  nomeFantasia?: string
) {
  const base = tipo === "PF" ? nomeCompleto : (razaoSocial || nomeFantasia || "")
  return normalizeName(base)
}

export async function createCliente(data: Input, usuarioId?: number | null, ip?: string | null) {
  const {
    tipo, nomeCompleto, razaoSocial, nomeFantasia, email, telefone,
    endereco1, endereco2, cidade, estado, zipcode, documento, observacoes,
    status = "ATIVO",
  } = data

  // Regras obrigatórias
  if (!email) throw new Error("email é obrigatório")
  if (!telefone) throw new Error("telefone é obrigatório")
  if (tipo === "PF" && !nomeCompleto) throw new Error("nomeCompleto é obrigatório para PF")
  if (tipo === "PJ" && !razaoSocial) throw new Error("razaoSocial é obrigatório para PJ")

  const emailNorm = email.trim().toLowerCase()
  const telNorm = normalizePhone(telefone)
  const nomeChave = buildNomeChave(tipo, nomeCompleto, razaoSocial, nomeFantasia)

  const documentoEnc = documento ? encryptDoc(documento) : null
  const docHash = documento ? docHashHex(documento) : null
  const docLast4 = documento ? last4(documento) : null

  try {
    const created = await prisma.$transaction(async (tx) => {
      const cli = await tx.cliente.create({
        data: {
          tipo,
          nomeCompleto: nomeCompleto ?? null,
          razaoSocial: razaoSocial ?? null,
          nomeFantasia: (nomeFantasia ?? "").trim() || null,
          email: emailNorm,
          telefone: telNorm,
          nomeChave,
          endereco1: endereco1 ?? null,
          endereco2: endereco2 ?? null,
          cidade: cidade ?? null,
          estado: estado ?? null,
          zipcode: zipcode ?? null,
          documentoEnc,
          docHash,
          docLast4,
          observacoes: (observacoes ?? "").trim() || null,
          status,
          atualizadoEm: new Date(),
        },
            }) as import("@prisma/client").Cliente
      await tx.auditoria.create({
        data: {
          tabela: "Cliente",
          registroId: cli.id,
          acao: "CREATE",
          usuarioId: usuarioId ?? null,
          ip: ip ?? null,
          payload: JSON.stringify({ tipo, email: emailNorm, telefone: telNorm }),
        },
      })
      return cli
  }) as import("@prisma/client").Cliente

  // Remover campos sensíveis do retorno por cópia superficial
  const safe = { ...(created as unknown as Record<string, unknown>) }
  delete (safe as Record<string, unknown>).documentoEnc
  delete (safe as Record<string, unknown>).docHash
  return safe as import("@prisma/client").Cliente
  } catch (e: unknown) {
    // PrismaClientKnownRequestError shape (without importing to keep light)
    const code = (e as { code?: string })?.code
    const meta = (e as { meta?: { target?: string | string[] } })?.meta
    const targets = Array.isArray(meta?.target) ? meta?.target : [meta?.target ?? ""]
    if (code === "P2002") {
      if (targets.some((t) => String(t).includes("email"))) throw new Error("E-mail já cadastrado")
      if (targets.some((t) => String(t).includes("docHash"))) throw new Error("Documento já cadastrado")
      if (targets.join("_").includes("nomeChave_telefone")) throw new Error("Cliente já cadastrado (nome + telefone)")
    }
    throw e
  }
}