export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { prisma } from "@/server/db"
import { generateToken, sha256Hex } from "@/lib/tokens"
import { EmailService } from "@/lib/email"
import { forgotPasswordSchema } from "@/lib/validation"

// Proteção contra execução durante build time
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

function baseUrlFrom(req: Request) {
  const h = (name: string) => req.headers.get(name) || ""
  const host = h("x-forwarded-host") || h("host") || "localhost:3000"
  const proto = h("x-forwarded-proto") || "http"
  return `${proto}://${host}`
}

export async function POST(req: Request) {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => ({}))
  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "E-mail inválido" }, { status: 422 })
  const email = parsed.data.email

  const rows: Array<{ id: number; email: string }> = await prisma.$queryRaw`
    SELECT id, email FROM Usuario WHERE email = ${email.toLowerCase().trim()} LIMIT 1
  `
  const user = rows[0]

  // Sempre responder 200 para não revelar existência
  let resetUrl: string | undefined
  if (user) {
    const raw = generateToken(32)
    const tokenHash = sha256Hex(raw)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1h

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    resetUrl = `${baseUrlFrom(req)}/reset-senha/${raw}`
    // Enviar e-mail com resetUrl
    try {
      console.log("[ForgotPassword] Tentando enviar email para:", user.email)
      const result = await EmailService.sendPasswordReset({
        to: user.email,
        userName: user.email,
        resetLink: resetUrl,
        expiresInHours: 1
      })
      console.log("[ForgotPassword] Resultado do envio:", result)
      if (!result.success) {
        console.error("[ForgotPassword] Falha no envio de email:", result.error)
      }
    } catch (err) {
      console.error("Falha ao enviar e-mail de reset:", err)
    }
  } else {
    // Em desenvolvimento, logar motivo de não envio para facilitar debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("[ForgotPassword] Usuário não encontrado, nenhum e-mail será enviado para:", email)
    }
  }

  return NextResponse.json({ ok: true, resetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined })
}