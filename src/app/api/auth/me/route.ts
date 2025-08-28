import { NextResponse } from "next/server"
import { requireUser } from "@/lib/rbac"

export const runtime = "nodejs"

// Proteção contra execução durante build time
function isBuildTime(): boolean {
  // Nunca considerar build time durante testes
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  
  return (
    typeof window === 'undefined' &&
    (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-production-server' ||
      process.env.NEXT_PHASE === 'phase-static' ||
      process.env.NEXT_PHASE === 'phase-export' ||
      (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production')
    )
  );
}

export async function GET() {
  // Proteção contra execução durante build time
  if (isBuildTime()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  const me = await requireUser()
  return NextResponse.json({
    id: me.id,
    email: me.email,
    role: me.role,
    status: me.status,
    nome: me.nome ?? null,
  })
}

