import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/server/db-temp'
import { AcaoPropostaLog, StatusProposta } from '@/types/propostas'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/propostas/[id] - Get proposta details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const proposta = await db.proposta.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        cliente: {
          select: {
            id: true,
            nomeCompleto: true,
            razaoSocial: true,
            email: true
          }
        },
        etapas: {
          orderBy: { ordem: 'asc' }
        },
        materiais: {
          orderBy: { nome: 'asc' }
        },
        anexos: {
          orderBy: { createdAt: 'desc' }
        },
        logs: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        projeto: {
          include: {
            cliente: {
              select: {
                id: true,
                nomeCompleto: true,
                razaoSocial: true
              }
            }
          }
        }
      }
    })

    if (!proposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Transform data for frontend
    const response = {
      ...proposta,
      cliente: proposta.cliente ? {
        id: proposta.cliente.id,
        nome: proposta.cliente.nomeCompleto || proposta.cliente.razaoSocial || 'Cliente',
        email: proposta.cliente.email
      } : null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching proposta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/propostas/[id] - Update proposta
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    // Check if proposta exists and is editable
    const existingProposta = await db.proposta.findFirst({
      where: {
        id,
        deletedAt: null
      }
    })

    if (!existingProposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    if (existingProposta.status !== StatusProposta.RASCUNHO) {
      return NextResponse.json(
        { error: 'Proposta não pode ser editada no status atual' },
        { status: 400 }
      )
    }

    // TODO: Validate body with schema
    // TODO: Get user from session
    const userId = 'temp-user-id'

  const updatedProposta = await db.$transaction(async (tx) => {
      // Update proposta
      const proposta = await tx.proposta.update({
        where: { id },
        data: {
          ...body,
          updatedAt: new Date()
        },
        include: {
          cliente: {
            select: {
              id: true,
              nomeCompleto: true,
              razaoSocial: true,
              email: true
            }
          }
        }
      })

      // Create audit log
      const proposalNumber = String((proposta as unknown as Record<string, unknown>)['numero'] ?? (proposta as unknown as Record<string, unknown>)['numeroProposta'] ?? '')
      await tx.propostaLog.create({
        data: {
          propostaId: id,
          usuarioId: userId,
          acao: AcaoPropostaLog.UPDATED,
          detalhes: `Proposta ${proposalNumber} atualizada`,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return proposta
    })

    // Transform response
    const response = {
      ...updatedProposta,
      cliente: updatedProposta.cliente
        ? {
            id: updatedProposta.cliente.id,
            nome: updatedProposta.cliente.nomeCompleto || updatedProposta.cliente.razaoSocial || 'Cliente',
            email: updatedProposta.cliente.email
          }
        : null
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error updating proposta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/propostas/[id] - Delete proposta (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check if proposta exists and can be deleted
    const existingProposta = await db.proposta.findFirst({
      where: {
        id,
        deletedAt: null
      }
    })

    if (!existingProposta) {
      return NextResponse.json(
        { error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    if (existingProposta.status !== StatusProposta.RASCUNHO) {
      return NextResponse.json(
        { error: 'Apenas propostas em rascunho podem ser excluídas' },
        { status: 400 }
      )
    }

    // TODO: Get user from session
    const userId = 'temp-user-id'

  await db.$transaction(async (tx) => {
      // Soft delete proposta
      await tx.proposta.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create audit log
      await tx.propostaLog.create({
        data: {
          propostaId: id,
          usuarioId: userId,
          acao: AcaoPropostaLog.CANCELLED,
          detalhes: `Proposta ${existingProposta.numeroProposta} excluída`,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    })

    return NextResponse.json({ message: 'Proposta excluída com sucesso' })

  } catch (error) {
    console.error('Error deleting proposta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
