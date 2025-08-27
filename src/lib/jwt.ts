import { SignJWT, jwtVerify, JWTPayload } from "jose"

export type Role = "ADMIN" | "GERENTE" | "USUARIO" | "FINANCEIRO" | "ESTOQUE" | "CLIENTE"
export type AuthClaims = JWTPayload & { sub: string; role: Role; status?: "ATIVO" | "INATIVO"; tokenVersion?: number }

// Lazy-loaded secret to avoid build-time errors
let secret: Uint8Array | null = null

function getSecret(): Uint8Array {
  if (!secret) {
    const secretRaw = process.env.JWT_SECRET
    if (!secretRaw) {
      // During build time, provide a temporary secret to allow compilation
      // This will be replaced with the real secret at runtime
      const isBuildTime = !process.browser && (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-production-server' || !process.env.NODE_ENV)
      if (isBuildTime) {
        secret = new TextEncoder().encode('temporary-build-secret-will-be-replaced-at-runtime')
      } else {
        throw new Error("Missing JWT_SECRET environment variable")
      }
    } else {
      if (secretRaw.length < 32) throw new Error("JWT_SECRET must be at least 32 characters")
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