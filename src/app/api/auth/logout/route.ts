export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { verifyAuthJWT } from "@/lib/jwt"
import { hasTokenVersionColumn } from "@/lib/db-metadata"

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined'
    ) &&
    process.env.NODE_ENV !== 'test'
  );
}

export async function POST(request: Request) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
  const payload: { message: string } = { message: 'Logout realizado com sucesso' };

  try {
    // Extrair cookies (Next.js Web API Request)
    const cookieHeader = request.headers.get('cookie') ?? undefined;
    const sessionToken = cookieHeader
      ?.split(';')
      .map((p) => p.trim())
      .find((p) => p.startsWith('sessionToken='))
      ?.split('=')[1];
    const cookieAuthToken = cookieHeader
      ?.split(';')
      .map((p) => p.trim())
      .find((p) => p.startsWith('authToken='))
      ?.split('=')[1];

    // Accept Authorization: Bearer <token> as alternative
    const authHeader = request.headers.get('authorization') ?? undefined;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const authToken = cookieAuthToken ?? headerToken;

    if (sessionToken) {
      try {
        const { SecurityService } = await import('@/lib/security');
        await SecurityService.revokeSessionByToken(sessionToken);
      } catch (_e: unknown) {
        console.warn('[Logout] Falha ao revogar sessão por token:', _e);
      }
    }

    // Invalida imediatamente JWTs existentes via incremento de tokenVersion
    if (authToken) {
      try {
        const claims = await verifyAuthJWT(authToken);
        const userId = Number(claims.sub);
        const hasCol = await hasTokenVersionColumn();
        if (!Number.isNaN(userId) && hasCol) {
          try {
            await prisma.$executeRaw`UPDATE Usuario SET tokenVersion = tokenVersion + 1 WHERE id = ${userId}`;
          } catch {
            // Falha transitória: ignore
          }
        }
      } catch {
        // token inválido, ignore
      }
    }
  } catch (_e: unknown) {
    console.warn('[Logout] Falha ao processar cookies:', _e);
  }

  // Limpar cookies de autenticação e sessão
  const res = NextResponse.json(payload);
  res.cookies.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.cookies.set('sessionToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}
