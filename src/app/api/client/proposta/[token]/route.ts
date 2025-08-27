import { NextRequest, NextResponse } from 'next/server'
// imports trimmed: prisma and StatusProposta are not used in this route
import { validateTokenPublico } from '@/lib/services/proposta-token'
import { applyRBACMasking, getUserPermissions, getPropostaContext } from '@/lib/services/proposta-rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      )
    }

    // Validate token and get proposal
    const proposta = await validateTokenPublico(token)

    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada ou token expirado' },
        { status: 404 }
      )
    }

    // Apply RBAC masking for client view
    const userPermissions = getUserPermissions(undefined, false); // Cliente não tem permissões especiais
    const context = getPropostaContext(proposta, true, userPermissions); // isClientView = true
    const maskedProposta = applyRBACMasking(proposta, context);

    return NextResponse.json(maskedProposta)

  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
