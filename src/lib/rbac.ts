import type { NextRequest } from "next/server"
import { verifyAuthJWT } from "./jwt"
import { prisma } from "@/server/db"
import { hasTokenVersionColumn } from "@/lib/db-metadata"
export type { ModuleKey, Action, Role } from "./rbac-core"
export { policy, can, routeToModule } from "./rbac-core"

export function hasRole(userRole: string, allowed: string[]) {
  return allowed.includes(userRole)
}

export async function requireUser(req?: NextRequest | Request) {
  // Obtém o cookie "authToken" do cabeçalho Cookie
  const header = req?.headers?.get?.("cookie") ?? ""
  const cookie = header
    .split(/;\s*/)
    .map((p) => p.split("="))
    .find((kv) => kv[0] === "authToken")?.[1]
    ? decodeURIComponent(header
        .split(/;\s*/)
        .map((p) => p.split("="))
        .find((kv) => kv[0] === "authToken")![1])
    : undefined
  if (!cookie) throw new Error("UNAUTHENTICATED")
  const claims = await verifyAuthJWT(cookie)
  if (await hasTokenVersionColumn()) {
    try {
      const rows = await prisma.$queryRaw<Array<{ tokenVersion: number }>>`
        SELECT tokenVersion FROM Usuario WHERE id = ${Number(claims.sub)} LIMIT 1
      `
      const currentVersion = rows[0]?.tokenVersion ?? 0
      if ((claims.tokenVersion ?? 0) !== currentVersion) throw new Error("UNAUTHENTICATED")
    } catch {
      // Falha transitória: não bloquear
    }
  }
  // include optional fields if present in the token
  return {
    id: claims.sub,
    role: String(claims.role),
    status: claims.status ?? "ATIVO",
    email: (claims as unknown as { email?: string } | undefined)?.email,
    nome: (claims as unknown as { nome?: string } | undefined)?.nome,
  }
}

export function requireRoles(userRole: string, roles: string[]) {
  if (!hasRole(userRole, roles)) throw new Error("FORBIDDEN")
}

/**
 * Permissões específicas para o módulo Cliente
 */
export const ClientePermissions = {
  // Leitura: ADMIN, GERENTE e USUARIO podem listar/visualizar
  canRead: (userRole: string) => hasRole(userRole, ['ADMIN', 'GERENTE', 'USUARIO']),
  
  // Criação: ADMIN e GERENTE podem criar
  canCreate: (userRole: string) => hasRole(userRole, ['ADMIN', 'GERENTE']),
  
  // Atualização: ADMIN e GERENTE podem editar
  canUpdate: (userRole: string) => hasRole(userRole, ['ADMIN', 'GERENTE']),
  
  // Deleção/Inativação: Apenas ADMIN pode inativar
  canDelete: (userRole: string) => hasRole(userRole, ['ADMIN']),
  
  // Documentos: ADMIN e GERENTE podem ver documentos descriptografados
  canViewDocuments: (userRole: string) => hasRole(userRole, ['ADMIN', 'GERENTE'])
}

/**
 * Middleware para verificar permissões de Cliente
 */
export async function requireClientePermission(
  req: NextRequest | Request,
  action: keyof typeof ClientePermissions
) {
  const user = await requireUser(req)
  
  if (!ClientePermissions[action](user.role)) {
    throw new Error("FORBIDDEN")
  }
  
  return user
}

// server-only helpers remain here (depend on request/cookies)