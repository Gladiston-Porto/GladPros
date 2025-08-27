import { SignJWT, jwtVerify, JWTPayload } from "jose"

const secretRaw = process.env.JWT_SECRET
if (!secretRaw) throw new Error("Missing JWT_SECRET")
if (secretRaw.length < 32) throw new Error("JWT_SECRET must be at least 32 characters")
const secret = new TextEncoder().encode(secretRaw)

export type Role = "ADMIN" | "GERENTE" | "USUARIO" | "FINANCEIRO" | "ESTOQUE" | "CLIENTE"
export type AuthClaims = JWTPayload & { sub: string; role: Role; status?: "ATIVO" | "INATIVO"; tokenVersion?: number }

export async function signAuthJWT(payload: { sub: string; role: Role; status?: "ATIVO" | "INATIVO"; tokenVersion?: number }, exp = "7d") {
  return await new SignJWT({ role: payload.role, status: payload.status, tokenVersion: payload.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer("gladpros")
    .setAudience("gladpros-app")
    .setExpirationTime(exp)
    .sign(secret)
}

export async function verifyAuthJWT(token: string) {
  const { payload } = await jwtVerify(token, secret, { issuer: "gladpros", audience: "gladpros-app" })
  return payload as AuthClaims
}