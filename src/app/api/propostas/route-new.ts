import { NextRequest, NextResponse } from 'next/server'
import { createPropostaSchema } from '@/lib/validations/proposta'
import { generateNumeroProposta } from '@/lib/services/proposta-numbering'
import { db, generatePropostaNumber } from '@/server/db-temp'
import { 
  StatusProposta,
  AcaoPropostaLog
} from '@/types/propostas'
import type { 
  CreatePropostaRequest, 
  PropostaFilters
} from '@/types/propostas'

// GET /api/propostas - List propostas with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate filters
    const filters: PropostaFilters = {
      busca: searchParams.get('busca') || undefined,
      status: searchParams.get('status') as StatusProposta || undefined,
      clienteId: searchParams.get('clienteId') || undefined,
      dataInicio: searchParams.get('dataInicio') || undefined,
      dataFim: searchParams.get('dataFim') || undefined,
    }
    
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // Build where clause
    const where: any = {
      deletedAt: null,
    }
    
    if (filters.busca) {
      where.OR = [
        { numero: { contains: filters.busca } },
        { descricao: { contains: filters.busca } },
        { cliente: { 
          OR: [
            { nomeCompleto: { contains: filters.busca } },
            { razaoSocial: { contains: filters.busca } }
          ]
        }}
      ]
    }
    
    if (filters.status) {
      where.status = filters.status
    }
    
    if (filters.clienteId) {
      where.clienteId = filters.clienteId
    }
    
    if (filters.dataInicio) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(filters.dataInicio)
      }
    }
    
    if (filters.dataFim) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.dataFim)
      }
    }
    
    // Add cursor-based pagination
    if (cursor) {
      const [createdAt, id] = cursor.split('_')
      where.OR = [
        { createdAt: { lt: new Date(createdAt) } },
        { 
          AND: [
            { createdAt: new Date(createdAt) },
            { id: { lt: id } }
          ]
        }
      ]
    }
    
    // Execute query
    const propostas = await db.proposta.findMany({
      where,
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
        materiais: true,
        anexos: true,
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
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: limit + 1
    })
    
    // Determine if there are more results
    const hasMore = propostas.length > limit
    const results = hasMore ? propostas.slice(0, -1) : propostas
    
    // Generate next cursor
    let nextCursor = null
    if (hasMore && results.length > 0) {
      const lastItem = results[results.length - 1]
      nextCursor = `${lastItem.createdAt.toISOString()}_${lastItem.id}`
    }
    
    // Transform data for frontend
    const transformedPropostas = results.map(proposta => ({
      ...proposta,
      cliente: proposta.cliente ? {
        id: proposta.cliente.id,
        nome: proposta.cliente.nomeCompleto || proposta.cliente.razaoSocial || 'Cliente',
        email: proposta.cliente.email
      } : null
    }))
    
    return NextResponse.json({
      propostas: transformedPropostas,
      nextCursor,
      hasMore,
      total: hasMore ? null : results.length // Only provide exact count for final page
    })
    
  } catch (error) {
    console.error('Error fetching propostas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/propostas - Create new proposta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createPropostaSchema.parse(body)
    const { etapas, materiais, ...propostaData } = validatedData
    
    // TODO: Get user from session
    const userId = 'temp-user-id' // Temporary for testing
    
    // Generate proposta number
    const numero = await generatePropostaNumber()
    
    // Calculate total value (placeholder - sem valor estimado nas etapas)
    const valorTotal = 0 // etapas.reduce((sum, etapa) => sum + (etapa.valorEstimado || 0), 0)
    
    // Create proposta with related data in transaction
    const result = await db.$transaction(async (tx) => {
      // Create proposta
      const proposta = await tx.proposta.create({
        data: {
          numero,
          ...propostaData,
          valorTotal,
          status: StatusProposta.RASCUNHO,
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
      
      // Create etapas
      if (etapas.length > 0) {
        await tx.propostaEtapa.createMany({
          data: etapas.map(etapa => ({
            ...etapa,
            propostaId: proposta.id,
          }))
        })
      }
      
      // Create materiais
      if (materiais.length > 0) {
        await tx.propostaMaterial.createMany({
          data: materiais.map(material => ({
            ...material,
            propostaId: proposta.id,
            valorTotal: material.quantidade * (material.precoUnitario || 0),
          }))
        })
      }
      
      // Create audit log
      await tx.propostaLog.create({
        data: {
          propostaId: proposta.id,
          usuarioId: userId,
          acao: AcaoPropostaLog.CREATED,
          detalhes: `Proposta ${numero} criada`,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
      
      return proposta
    })
    
    // Transform response
    const response = {
      ...result,
      cliente: result.cliente ? {
        id: result.cliente.id,
        nome: result.cliente.nomeCompleto || result.cliente.razaoSocial || 'Cliente',
        email: result.cliente.email
      } : null
    }
    
    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error('Error creating proposta:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
