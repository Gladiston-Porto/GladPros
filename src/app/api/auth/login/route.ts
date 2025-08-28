// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { PasswordService } from "@/lib/password";
import { MFAService } from "@/lib/mfa";
import { BlockingService } from "@/lib/blocking";
import { loginRateLimit } from "@/lib/rate-limit";
import { AuditLogger } from "@/lib/audit";
import { loginSchema } from "@/lib/validation";

function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || 
         req.headers.get("x-real-ip") || 
         req.headers.get("cf-connecting-ip") || 
         "unknown";
}

// Proteção contra execução durante build time
function isBuildTime(): boolean { return ( typeof window === 'undefined' && ( process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-production-server' || process.env.NEXT_PHASE === 'phase-static' || process.env.NEXT_PHASE === 'phase-export' || !process.env.JWT_SECRET || typeof process.env.NODE_ENV === 'undefined' ) && process.env.NODE_ENV !== 'test' ); }

export async function POST(req: NextRequest) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
  // Aplicar rate limiting
  const rateLimitResult = await loginRateLimit.isAllowed(req);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: rateLimitResult.message,
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  const ip = getClientIP(req);
  const userAgent = req.headers.get("user-agent") || undefined;
  
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" }, 
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    // Buscar usuário
    const rows: Array<{
      id: number;
      email: string;
      nomeCompleto: string;
      senha: string;
      senhaProvisoria: boolean;
      primeiroAcesso: boolean;
      status: string;
    }> = await prisma.$queryRaw`
      SELECT id, email, nomeCompleto, senha, senhaProvisoria, primeiroAcesso, status
      FROM Usuario 
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = rows[0];

    // Verificar se usuário existe
    if (!user) {
      await BlockingService.recordFailedAttempt({ email, ip, userAgent, motivo: 'INVALID_EMAIL' });
      return NextResponse.json(
        { error: "Credenciais inválidas" }, 
        { status: 401 }
      );
    }

    // Verificar status do usuário
    if (user.status !== "ATIVO") {
      return NextResponse.json(
        { error: "Conta inativa. Entre em contato com o administrador." }, 
        { status: 401 }
      );
    }

    // Verificar se usuário está bloqueado
    const blockInfo = await BlockingService.checkUserBlock(user.id);
    if (blockInfo.blocked) {
      let errorMsg = "Conta temporariamente bloqueada devido a múltiplas tentativas incorretas.";
      
      if (blockInfo.unlockAt) {
        const minutesLeft = Math.ceil((blockInfo.unlockAt.getTime() - Date.now()) / (1000 * 60));
        errorMsg += ` Tente novamente em ${minutesLeft} minuto(s).`;
      } else {
        errorMsg += " Entre em contato com o administrador.";
      }

      return NextResponse.json(
        { 
          error: errorMsg,
          blocked: true,
          unlockAt: blockInfo.unlockAt,
          requiresPinUnlock: blockInfo.requiresPinUnlock,
          requiresSecurityQuestion: blockInfo.requiresSecurityQuestion
        }, 
        { status: 423 } // 423 Locked
      );
    }

    // Verificar senha
    const isValidPassword = await PasswordService.verifyPassword(password, user.senha);
    if (!isValidPassword) {
      await BlockingService.recordFailedAttempt({ 
        userId: user.id, 
        email, 
        ip, 
        userAgent,
        motivo: 'INVALID_PASSWORD'
      });

      // Log de auditoria para tentativa falhada
      await AuditLogger.logLogin(user.id, user.email, req, false, {
        reason: 'invalid_password'
      });

      return NextResponse.json(
        { error: "Credenciais inválidas" }, 
        { status: 401 }
      );
    }

  // Senha válida - aguardar verificação de MFA para concluir login

    // Determinar tipo de acesso
    let accessType: "PRIMEIRO_ACESSO" | "LOGIN" = "LOGIN";
    let nextStep = "mfa";

    if (user.primeiroAcesso) {
      accessType = "PRIMEIRO_ACESSO";
      nextStep = "primeiro-acesso";
      
      // Verificar se senha é provisória e expirou
      if (user.senhaProvisoria) {
        const senhaExpirada = await prisma.$queryRaw<Array<{ expired: boolean }>>`
          SELECT (criadoEm < DATE_SUB(NOW(), INTERVAL 7 DAY)) as expired
          FROM Usuario 
          WHERE id = ${user.id}
        `;
        
        if (senhaExpirada[0]?.expired) {
          return NextResponse.json({
            error: "Senha provisória expirada",
            requiresPasswordReset: true
          }, { status: 410 }); // 410 Gone
        }
      }
    }

    // Gerar código MFA
    const { code: mfaCode } = await MFAService.createMFACode({
      usuarioId: user.id,
      tipoAcao: accessType,
      ip,
      userAgent
    });

    // Enviar código MFA por email
    const { EmailService } = await import("@/lib/email");
    const emailResult = await EmailService.sendMFA({
      to: user.email,
      userName: user.nomeCompleto,
      code: mfaCode,
      expiresInMinutes: 5,
      isFirstAccess: user.primeiroAcesso
    });

    if (!emailResult.success) {
      console.error("[API] Erro ao enviar email MFA:", emailResult.error);
      // Em desenvolvimento, mostrar código no console mesmo se email falhar
      if (process.env.NODE_ENV === 'development' && process.env.NODE_ENV !== 'test') {
        console.log(`[DEV] Código MFA para ${user.email}: ${mfaCode}`);
      }
    }

  // Não registra sucesso aqui; isso ocorrerá após verificação MFA

    return NextResponse.json({
      success: true,
      mfaRequired: true,
      nextStep,
      user: {
        id: user.id,
        email: user.email,
        nomeCompleto: user.nomeCompleto,
        primeiroAcesso: user.primeiroAcesso,
        senhaProvisoria: user.senhaProvisoria
      }
    }, { status: 200 });

  } catch (error) {
    // Print full error and stack to help debugging in dev
    try {
      console.error("[API] Login error:", error);
      if (error instanceof Error) {
        console.error("[API] Login stack:", error.stack);
      } else {
        console.error("[API] Login non-error object:", JSON.stringify(error, null, 2));
      }
    } catch (logErr) {
      // Fallback if logging itself fails
      console.error("[API] Failed to log error in login handler:", logErr);
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}

