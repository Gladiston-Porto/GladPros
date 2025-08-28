import { SignJWT, jwtVerify, JWTPayload } from "jose"

export type Role = "ADMIN" | "GERENTE" | "USUARIO" | "FINANCEIRO" | "ESTOQUE" | "CLIENTE"
export type AuthClaims = JWTPayload & { sub: string; role: Role; status?: "ATIVO" | "INATIVO"; tokenVersion?: number }

// Lazy-loaded secret to avoid build-time errors
let secret: Uint8Array | null = null

function getSecret(): Uint8Array {
  if (!secret) {
    const secretRaw = process.env.JWT_SECRET
    if (!secretRaw) {
      // Proteção mais robusta contra build time
      const isBuildTime =
        typeof window === 'undefined' &&
        (
          process.env.NEXT_PHASE === 'phase-production-build' ||
          process.env.NEXT_PHASE === 'phase-production-server' ||
          process.env.NEXT_PHASE === 'phase-static' ||
          process.env.NEXT_PHASE === 'phase-export' ||
          process.env.NEXT_PHASE === 'phase-development-build' ||
          !process.env.NODE_ENV ||
          process.env.NODE_ENV === 'development' ||
          !process.env.JWT_SECRET
        );

      if (isBuildTime) {
        console.warn('[JWT] Usando secret temporário durante build. Certifique-se de definir JWT_SECRET em produção.');
        secret = new TextEncoder().encode('temporary-build-secret-will-be-replaced-at-runtime-32-chars-minimum')
      } else {
        throw new Error("Missing JWT_SECRET environment variable. Certifique-se de definir esta variável em .env.local")
      }
    } else {
      if (secretRaw.length < 32) throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres")
      secret = new TextEncoder().encode(secretRaw)
    }
  }
  return secret
}

export async function signAuthJWT(payload: { sub: string; role: Role; status?: "ATIVO" | "INATIVO"; tokenVersion?: number }, exp = "7d") {
  return await new SignJWT({ role: payload.role, status: payload.status, tokenVersion: payload.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer("gladpros")
    .setAudience("gladpros-app")
    .setExpirationTime(exp)
    .sign(getSecret())
}

export async function verifyAuthJWT(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), { issuer: "gladpros", audience: "gladpros-app" })
  return payload as AuthClaims
}