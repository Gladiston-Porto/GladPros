// src/app/api/auth/mfa/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { hasTokenVersionColumn } from "@/lib/db-metadata";
import { MFAService } from "@/lib/mfa";
import { signAuthJWT, type Role } from "@/lib/jwt";
import { mfaRateLimit } from "@/lib/rate-limit";
import { mfaVerificationSchema } from "@/lib/validation";
import { SecurityService } from "@/lib/security";

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      process.env.NEXT_PHASE === 'phase-static' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      !process.env.JWT_SECRET ||
      typeof process.env.NODE_ENV === 'undefined' ||
      process.env.NODE_ENV === 'development'
    )
  );
}

export async function POST(req: NextRequest) {
  // Se estiver em build time, retorna resposta de serviço indisponível
  if (isBuildTime()) {
    return new Response(JSON.stringify({
      error: 'Service unavailable during build',
      message: 'This endpoint is not available during the build process'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = mfaVerificationSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID do usuário e código são obrigatórios" },
        { status: 400 }
      );
    }
    const { userId, code, tipoAcao = "LOGIN" } = parsed.data;
    const tipoAcaoMapped: "LOGIN" | "RESET" | "PRIMEIRO_ACESSO" | "DESBLOQUEIO" =
      tipoAcao === "RESET_PASSWORD" ? "RESET" : (tipoAcao as "LOGIN" | "PRIMEIRO_ACESSO");

    // Buscar email do usuário para rate limiting
    const userRows = await prisma.$queryRaw<Array<{
      email: string;
    }>>`
      SELECT email FROM Usuario WHERE id = ${userId} LIMIT 1
    `;

    const userEmail = userRows[0]?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Aplicar rate limiting por email
    const rateLimitResult = await mfaRateLimit.checkLimit(req, `mfa:${userEmail}`);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.message,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Verificar código MFA
    const mfaResult = await MFAService.verifyMFACode({
      usuarioId: userId,
      code,
      tipoAcao: tipoAcaoMapped
    });

    if (!mfaResult.valid) {
      return NextResponse.json(
        { error: mfaResult.error || "Código inválido" },
        { status: 401 }
      );
    }

    // Buscar dados completos do usuário
    let fullUserRows: Array<{ id: number; email: string; nomeCompleto: string | null; primeiroAcesso: boolean; senhaProvisoria: boolean; tipo: string | null; tokenVersion: number }> = [];
    if (await hasTokenVersionColumn()) {
      try {
        fullUserRows = await prisma.$queryRaw<Array<{
          id: number;
          email: string;
          nomeCompleto: string | null;
          primeiroAcesso: boolean;
          senhaProvisoria: boolean;
          tipo: string | null;
          tokenVersion: number;
        }>>`
          SELECT id, email, nomeCompleto, primeiroAcesso, senhaProvisoria, nivel as tipo, tokenVersion
          FROM Usuario 
          WHERE id = ${userId}
          LIMIT 1
        `;
      } catch {
        // if it fails for some other reason, fall back to without tokenVersion
      }
    }
    if (fullUserRows.length === 0) {
      const alt = await prisma.$queryRaw<Array<{
        id: number;
        email: string;
        nomeCompleto: string | null;
        primeiroAcesso: boolean;
        senhaProvisoria: boolean;
        tipo: string | null;
      }>>`
        SELECT id, email, nomeCompleto, primeiroAcesso, senhaProvisoria, nivel as tipo
        FROM Usuario
        WHERE id = ${userId}
        LIMIT 1
      `;
      fullUserRows = alt.map((r) => ({ ...r, tokenVersion: 0 }));
    }

    const user = fullUserRows[0];
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

  // Gerar JWT usando jose
    const role = ((user.tipo || 'USUARIO').toUpperCase() as Role);
  const token = await signAuthJWT({
      sub: user.id.toString(),
      role,
      status: 'ATIVO',
      tokenVersion: user.tokenVersion ?? 0
    }, "24h");

    // Registrar tentativa bem-sucedida e atualizar último login
    const reqIp = getClientIP(req);
    const reqUA = req.headers.get("user-agent") || undefined;
    await prisma.$executeRaw`
      INSERT INTO TentativaLogin (usuarioId, email, sucesso, ip, userAgent)
      VALUES (${user.id}, ${user.email}, TRUE, ${reqIp}, ${reqUA})
    `;
    await prisma.$executeRaw`
      UPDATE Usuario 
      SET ultimoLoginEm = NOW() 
      WHERE id = ${user.id}
    `;

    // Desbloquear usuário e manter histórico de falhas
    try {
      const { BlockingService } = await import("@/lib/blocking");
      await BlockingService.clearFailedAttempts(user.id);
    } catch (e) {
      console.warn("[MFA] Falha ao desbloquear usuário após sucesso:", e);
    }

    // Se é primeiro acesso, redirecionar para configuração
    if (user.primeiroAcesso) {
      const response = NextResponse.json({
        success: true,
        requiresSetup: true,
        nextStep: "primeiro-acesso",
        redirectUrl: `/primeiro-acesso?userId=${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          nomeCompleto: user.nomeCompleto,
          primeiroAcesso: user.primeiroAcesso,
          senhaProvisoria: user.senhaProvisoria
        }
      });

      // Set httpOnly cookie para autenticação temporária
      response.cookies.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 // 24 hours
      });

      return response;
    }

    // Criar sessão ativa para o usuário autenticado
    const ip = reqIp;
    const userAgent = reqUA;
    let sessionToken: string | undefined;
    try {
      sessionToken = await SecurityService.createSession(user.id, ip, userAgent);
    } catch (e) {
      // Não bloquear o login se falhar criar sessão; apenas logar para investigação
      console.warn("[MFA] Falha ao criar sessão ativa:", e);
    }

    // Login normal completo
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nomeCompleto: user.nomeCompleto,
        tipo: user.tipo
      },
      token // Também retorna no body para compatibilidade
    });

  // Set httpOnly cookie (JWT)
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 // 24 hours
    });
    if (sessionToken) {
      response.cookies.set("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60
      });
    }

    return response;

  } catch (error) {
    console.error("[API] MFA Verify error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
