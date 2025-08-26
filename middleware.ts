// Fonte oficial de middleware.
// Versões antigas/experimentais estão em /archived-middleware.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthJWT, AuthClaims } from "@/lib/jwt";
import { prisma } from "@/server/db";
import { hasTokenVersionColumn } from "@/lib/db-metadata";

// Rotas que não precisam de autenticação
const publicRoutes = [
  "/_next",
  "/images",
  "/favicon.ico",
  "/icon.ico",
  "/login",
  "/esqueci-senha",
  "/reset-senha",
  "/desbloqueio",
  "/mfa",
  "/primeiro-acesso",
  "/api/auth/login",
  "/api/auth/mfa",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/first-access"
];

// Rotas que requerem autenticação
const authRoutes = [
  "/dashboard",
  "/usuarios",
  "/clientes",
  "/financeiro",
  "/projetos",
  "/propostas",
  "/estoque",
  "/api/usuarios",
  "/api/clientes",
  "/api/financeiro"
];

// Verificar se a rota é pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + "/") || 
    pathname.startsWith(route + "?")
  );
}

// Verificar se a rota requer autenticação
function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + "/") || 
    pathname.startsWith(route + "?")
  );
}

// Verificar e decodificar JWT
async function verifyToken(token: string): Promise<AuthClaims | null> {
  try {
    const decoded = await verifyAuthJWT(token);
    // Valida tokenVersion apenas se a coluna existir
    if (await hasTokenVersionColumn()) {
      try {
        const rows = await prisma.$queryRaw<Array<{ tokenVersion: number }>>`
          SELECT tokenVersion FROM Usuario WHERE id = ${Number(decoded.sub)} LIMIT 1
        `;
        const currentVersion = rows[0]?.tokenVersion ?? 0;
        if ((decoded.tokenVersion ?? 0) !== currentVersion) return null;
      } catch {
        // Falha transitória: não bloquear autenticação
      }
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Redirecionar root para login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", origin));
  }

  // Permitir rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verificar autenticação
  if (isAuthRoute(pathname)) {
    const token = req.cookies.get("authToken")?.value;
    
    if (!token) {
      if (process.env.NODE_ENV !== 'production') console.log(`[MIDDLEWARE] Token não encontrado para: ${pathname}`);
      return NextResponse.redirect(new URL("/login?error=unauthorized", origin));
    }

    const claims = await verifyToken(token);
    if (!claims) {
      if (process.env.NODE_ENV !== 'production') console.log(`[MIDDLEWARE] Token inválido para: ${pathname}`);
      return NextResponse.redirect(new URL("/login?error=invalid_token", origin));
    }

  if (process.env.NODE_ENV !== 'production') console.log(`[MIDDLEWARE] Acesso autorizado para: ${pathname} (usuário: ${claims.sub})`);
    // Token válido, adicionar headers com info do usuário
    const response = NextResponse.next();
    response.headers.set("x-user-id", claims.sub);
    response.headers.set("x-user-role", claims.role);
    response.headers.set("x-user-status", claims.status || 'ATIVO');
    
    return response;
  }

  // Para outras rotas, continuar normalmente
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
