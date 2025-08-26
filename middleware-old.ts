import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthJWT } from "@/lib/jwt";
import { can, type ModuleKey, type Action } from "@/lib/rbac";

const publicPrefixes = [
  "/_next",
  "/images",
  "/favicon.ico",
  "/login",
  "/esqueci-senha",
  "/reset-senha",
  "/primeiro-acesso", // ← adicionado: libera páginas de primeiro acesso/troca de senha
  "/api/auth",
];

function pathToModule(pathname: string): any /* ModuleKey */ {
  if (pathname.startsWith("/usuarios") || pathname.startsWith("/api/usuarios")) return "usuarios";
  if (pathname.startsWith("/financeiro") || pathname.startsWith("/api/financeiro")) return "financeiro";
  if (pathname.startsWith("/clientes") || pathname.startsWith("/api/clientes")) return "clientes";
  if (pathname.startsWith("/projetos") || pathname.startsWith("/api/projetos")) return "projetos";
  if (pathname.startsWith("/propostas") || pathname.startsWith("/api/propostas")) return "propostas";
  if (pathname.startsWith("/estoque") || pathname.startsWith("/api/estoque")) return "estoque";
  return null;
}

function methodToAction(method: string): Action {
  switch (method) {
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "read";
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // root should redirect to login to force auth flow
  if (pathname === "/") return NextResponse.redirect(new URL("/login", origin));

  // libera estáticos e rotas públicas (inclui /primeiro-acesso e /api/auth/*)
  if (publicPrefixes.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", origin));

  try {
    const claims = await verifyAuthJWT(token);
    if (claims.status !== "ATIVO") return NextResponse.redirect(new URL("/login?e=inactive", origin));

    const moduleKey = pathToModule(pathname);
    if (!moduleKey) return NextResponse.next();

    const action = pathname.startsWith("/api/") ? methodToAction(req.method) : "read";
    const role = String(claims.role || "USUARIO").toUpperCase() as any;
    if (!can(role, moduleKey, action)) {
      return NextResponse.redirect(new URL("/?e=forbidden", origin));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login?e=token", origin));
  }
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
