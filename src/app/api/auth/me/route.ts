import { NextResponse } from "next/server"
import { requireUser } from "@/lib/rbac"

export const runtime = "nodejs"

export async function GET() {
  const me = await requireUser()
  return NextResponse.json({
    id: me.id,
    email: me.email,
    role: me.role,
    status: me.status,
    nome: me.nome ?? null,
  })
}
