import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface AuthClaims {
  userId: number;
  email: string;
  tipo: string;
  iat?: number;
  exp?: number;
  iss?: string;
  sub?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";

// Rotas que não precisam de autenticação
const publicRoutes = [
  "/_next",
  "/images",
  "/favicon.ico",
  "/icon.ico",
  "/login",
  "/esqueci-senha",
  "/reset-senha",
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
  const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  return payload as unknown as AuthClaims;
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
    const token = req.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", origin));
    }

    const claims = await verifyToken(token);
    if (!claims) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", origin));
    }

    // Token válido, adicionar headers com info do usuário
    const response = NextResponse.next();
    response.headers.set("x-user-id", claims.userId.toString());
    response.headers.set("x-user-email", claims.email);
    response.headers.set("x-user-type", claims.tipo);
    
    return response;
  }

  // Para outras rotas, continuar normalmente
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
