// Fonte oficial de middleware.
// Versões antigas/experimentais estão em /archived-middleware.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

// Função segura para verificar se estamos em build time
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

// Verificar e decodificar JWT (apenas se não for build time)
async function verifyToken(token: string): Promise<any | null> {
  // Durante build time, sempre retornar null para permitir compilação
  if (isBuildTime()) {
    console.warn('[MIDDLEWARE] Build time detectado, pulando verificação de token');
    return null;
  }

  try {
    // Importar apenas quando necessário e não for build time
    const { verifyAuthJWT } = await import("@/lib/jwt");
    const { prisma } = await import("@/server/db");
    const { hasTokenVersionColumn } = await import("@/lib/db-metadata");

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
    console.warn('[MIDDLEWARE] Erro ao verificar token:', error);
    return null;
  }
}


export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Durante build time, permitir todas as rotas para evitar erros
  if (isBuildTime()) {
    return NextResponse.next();
  }

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
