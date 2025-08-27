import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAuthJWT, type AuthClaims } from './jwt'
import { prisma } from '@/server/db'
import { hasTokenVersionColumn } from '@/lib/db-metadata'

export type ServerUser = { id: string; role: string; email?: string; name?: string }

export async function requireServerUser(): Promise<ServerUser> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('authToken')?.value
  if (!cookie) return redirect('/login')

  try {
    const claims: AuthClaims = await verifyAuthJWT(cookie)
    
    // Buscar dados do usuário no banco
    const userRows = await prisma.$queryRaw<Array<{ 
      id: number; 
      email: string; 
      nomeCompleto: string | null; 
      tokenVersion: number;
      status: string 
    }>>`
      SELECT id, email, nomeCompleto, tokenVersion, status 
      FROM Usuario 
      WHERE id = ${Number(claims.sub)} 
      LIMIT 1
    `

    if (!userRows.length) return redirect('/login?e=user')
    const usuario = userRows[0]

    // tokenVersion check (apenas se coluna existir)
    if (await hasTokenVersionColumn()) {
      try {
        const currentVersion = usuario.tokenVersion ?? 0
        if ((claims.tokenVersion ?? 0) !== currentVersion) return redirect('/login?e=tokenver')
      } catch {
        // Falha transitória: não bloquear
      }
    }
    
    if (claims.status !== 'ATIVO' || usuario.status !== 'ATIVO') return redirect('/login?e=inactive')
    
    return {
      id: String(claims.sub),
      role: String(claims.role ?? 'USUARIO'),
      email: usuario.email || undefined,
      name: usuario.nomeCompleto || 'Usuário'
    }
  } catch {
    return redirect('/login?e=token')
  }
}
