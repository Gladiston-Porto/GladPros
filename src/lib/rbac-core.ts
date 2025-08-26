export type ModuleKey = "usuarios" | "financeiro" | "clientes" | "projetos" | "propostas" | "estoque"
export type Action = "read" | "create" | "update" | "delete"
export type Role = "ADMIN" | "GERENTE" | "USUARIO" | "FINANCEIRO" | "ESTOQUE" | "CLIENTE"

const ALL: Action[] = ["read", "create", "update", "delete"]
const RO: Action[] = ["read"]
const NONE: Action[] = []

export const policy: Record<ModuleKey, Partial<Record<Role, Action[]>>> = {
  usuarios:   { ADMIN: ALL },
  financeiro: { ADMIN: ALL, FINANCEIRO: ALL },
  // ESTOQUE agora tem acesso TOTAL a clientes
  clientes:   { ADMIN: ALL, GERENTE: ALL, USUARIO: ALL, FINANCEIRO: ALL, ESTOQUE: ALL },
  // ESTOQUE agora tem acesso TOTAL a projetos
  projetos:   { ADMIN: ALL, GERENTE: ALL, USUARIO: ALL, FINANCEIRO: ALL, ESTOQUE: ALL, CLIENTE: RO },
  propostas:  { ADMIN: ALL, GERENTE: ALL, FINANCEIRO: ALL, ESTOQUE: NONE, USUARIO: NONE, CLIENTE: NONE },
  estoque:    { ADMIN: ALL, ESTOQUE: ALL, GERENTE: RO, USUARIO: RO, FINANCEIRO: RO },
}

export function can(role: Role, moduleKey: ModuleKey, action: Action): boolean {
  if (role === "ADMIN") return true
  const allowed = policy[moduleKey]?.[role] ?? NONE
  return allowed.includes(action)
}

export function routeToModule(pathname: string): ModuleKey | null {
  if (pathname.startsWith("/usuarios") || pathname.startsWith("/api/usuarios")) return "usuarios"
  if (pathname.startsWith("/financeiro") || pathname.startsWith("/api/financeiro")) return "financeiro"
  if (pathname.startsWith("/clientes") || pathname.startsWith("/api/clientes")) return "clientes"
  if (pathname.startsWith("/projetos") || pathname.startsWith("/api/projetos")) return "projetos"
  if (pathname.startsWith("/propostas") || pathname.startsWith("/api/propostas")) return "propostas"
  if (pathname.startsWith("/estoque") || pathname.startsWith("/api/estoque")) return "estoque"
  return null
}
