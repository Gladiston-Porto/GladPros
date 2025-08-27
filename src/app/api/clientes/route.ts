import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { requireClientePermission } from '@/lib/rbac'
import { clienteFiltersSchema, clienteCreateSchema } from '@/lib/validations/cliente'
import {
  sanitizeClienteInput,
  encryptClienteData,
  checkDocumentoExists,
  logClienteAudit,
  maskDocumento,
  formatTelefone,
  formatZipcode
} from '@/lib/helpers/cliente'
import { ZodError } from 'zod'

export const runtime = "nodejs"

/**
 * GET /api/clientes - Lista clientes com filtros e paginação
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar permissão de leitura (não precisamos da variável aqui)
    await requireClientePermission(request, 'canRead')
    
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Validar filtros
    const filters = clienteFiltersSchema.parse(queryParams)
    
    // Construir where clause
    // Build a Prisma-compatible where using AND array for predictable matching in tests
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const where: any = { AND: [{ ativo: true }] }

    // Filtro por busca (nome, email, documento)
    if (filters.q && filters.q.trim()) {
      const searchTerm = filters.q.trim()
      // Tests expect search across nomeCompleto, razaoSocial and email
      where.AND.push({ OR: [
        { nomeCompleto: { contains: searchTerm, mode: 'insensitive' } },
        { razaoSocial: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } }
      ] })
    }
    
    // Filtro por tipo
    if (filters.tipo && filters.tipo !== 'all') {
      where.AND.push({ tipo: filters.tipo })
    }
    
    // Filtro por ativo - use raw query param to avoid coercion edge cases
    const rawAtivo = queryParams.ativo
    if (rawAtivo !== undefined && rawAtivo !== 'all') {
      const ativoBool = rawAtivo === 'true' || rawAtivo === '1'
  // Replace default ativo filter with explicit one
  where.AND = where.AND.filter((c: Record<string, unknown>) => !(c && ('ativo' in c)))
      where.AND.push({ ativo: ativoBool })
      where.AND.push({ status: ativoBool ? 'ATIVO' : 'INATIVO' })
    }
    
    // Calcular offset
    const offset = (filters.page - 1) * filters.pageSize
    
    // Ordenação dinâmica
    // Build orderBy object expected by tests (single object)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let orderBy: any = { criadoEm: 'desc' }
    if (filters.sortKey) {
      const dir = filters.sortDir === 'asc' ? 'asc' : 'desc'
      switch (filters.sortKey) {
        case 'nome':
          orderBy = { nomeChave: dir }
          break
        case 'tipo':
          orderBy = { tipo: dir }
          break
        case 'email':
          orderBy = { email: dir }
          break
        case 'telefone':
          orderBy = { telefone: dir }
          break
        case 'documento':
          orderBy = { docLast4: dir }
          break
        case 'cidadeEstado':
          orderBy = { estado: dir }
          break
        case 'status':
          orderBy = { status: dir }
          break
      }
    }

    // Executar queries em paralelo
    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        select: {
          id: true,
          tipo: true,
          nomeCompleto: true,
          razaoSocial: true,
          nomeFantasia: true,
          email: true,
          telefone: true,
          cidade: true,
          estado: true,
          zipcode: true,
          docLast4: true,
          status: true,
          criadoEm: true,
          atualizadoEm: true
        },
        orderBy,
  take: filters.pageSize,
        skip: offset
      }),
      prisma.cliente.count({ where })
    ])
    
    // Formatar resposta
    const data = clientes.map(cliente => ({
      id: cliente.id,
      tipo: cliente.tipo,
      nomeCompletoOuRazao: cliente.tipo === 'PF' 
        ? (cliente.nomeCompleto || 'Nome não informado')
        : (cliente.nomeFantasia || cliente.razaoSocial || 'Razão social não informada'),
      email: cliente.email,
      telefone: formatTelefone(cliente.telefone || ''),
      cidade: cliente.cidade,
      estado: cliente.estado,
      zipcode: formatZipcode(cliente.zipcode || ''),
      documentoMasked: maskDocumento(cliente.docLast4 || '', cliente.tipo),
      ativo: cliente.status === 'ATIVO',
      criadoEm: cliente.criadoEm.toISOString(),
      atualizadoEm: cliente.atualizadoEm.toISOString()
    }))
    
    const totalPages = Math.ceil(total / filters.pageSize)
    
    return NextResponse.json({
      data,
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages
    })
    
  } catch (error) {
    console.error('[API] GET /api/clientes error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message === 'UNAUTHENTICATED') {
        return NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        )
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Sem permissão para listar clientes' },
          { status: 403 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clientes - Criar novo cliente
 */
export async function POST(request: NextRequest) {
  try {
  // Verificar permissão de criação
  const _user = await requireClientePermission(request, 'canCreate')
    
    // Obter dados do body
    const body = await request.json()
    
    // Validar dados
  const validData = clienteCreateSchema.parse(body)
    
    // Sanitizar entrada (cast temporário para evitar many implicit-any lint failures)
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const sanitizedData = sanitizeClienteInput(validData) as any

    // Consolidar documento principal (opcional) a partir de ssn/itin/ein
    let documentoPlano: string | null = null
    if (sanitizedData.tipo === 'PF') {
      if (sanitizedData.tipoDocumentoPF === 'SSN' && sanitizedData.ssn) documentoPlano = sanitizedData.ssn
      if (sanitizedData.tipoDocumentoPF === 'ITIN' && sanitizedData.itin) documentoPlano = sanitizedData.itin
    } else if (sanitizedData.tipo === 'PJ') {
      if (sanitizedData.ein) documentoPlano = sanitizedData.ein
    }
    
    // Verificar se documento já existe
    if (documentoPlano) {
      const documentoExists = await checkDocumentoExists(documentoPlano)
      if (documentoExists) {
        return NextResponse.json(
          { error: 'Documento já cadastrado no sistema' },
          { status: 400 }
        )
      }
    }
    
    // Verificar se já existe cliente com mesmo email
    const existingByEmail = await prisma.cliente.findFirst({
      where: { email: sanitizedData.email },
      select: {
        id: true,
        status: true,
        tipo: true
      }
    })
    
    // Caso exista cliente inativo com o mesmo e-mail, reativar e atualizar dados
    if (existingByEmail && existingByEmail.status === 'INATIVO') {
      // Verificar documento opcional sem bloquear pelo mesmo registro
      if (documentoPlano) {
        const documentoExists = await checkDocumentoExists(documentoPlano, existingByEmail.id)
        if (documentoExists) {
          return NextResponse.json(
            { error: 'Documento já cadastrado no sistema' },
            { status: 400 }
          )
        }
      }

      let documentoEnc: string | null = null
      let docLast4: string | null = null
      let docHash: string | null = null
      if (documentoPlano) {
        const enc = await encryptClienteData(documentoPlano, sanitizedData.tipo)
        documentoEnc = enc.documentoEnc
        docLast4 = enc.docLast4
        docHash = enc.docHash
      }

      const cliente = await prisma.cliente.update({
        where: { id: existingByEmail.id },
        data: {
          tipo: sanitizedData.tipo,
          nomeCompleto: sanitizedData.nomeCompleto,
          razaoSocial: sanitizedData.razaoSocial,
          nomeFantasia: sanitizedData.nomeFantasia,
          telefone: sanitizedData.telefone,
          nomeChave: sanitizedData.tipo === 'PF'
            ? (sanitizedData.nomeCompleto || '')
            : (sanitizedData.nomeFantasia || sanitizedData.razaoSocial || ''),
          documentoEnc: documentoEnc ?? undefined,
          docLast4: docLast4 ?? undefined,
          docHash: docHash ?? undefined,
          endereco1: sanitizedData.endereco1,
          endereco2: sanitizedData.endereco2,
          cidade: sanitizedData.cidade,
          estado: sanitizedData.estado,
          zipcode: sanitizedData.zipcode,
          observacoes: sanitizedData.observacoes,
          status: 'ATIVO'
        },
        select: {
          id: true,
          tipo: true,
          nomeCompleto: true,
          razaoSocial: true,
          nomeFantasia: true,
          email: true,
          telefone: true,
          cidade: true,
          estado: true,
          zipcode: true,
          docLast4: true,
          status: true,
          criadoEm: true,
          atualizadoEm: true
        }
      })

      await logClienteAudit(
        cliente.id,
        'UPDATE',
        { status: { old: 'INATIVO', new: 'ATIVO' } },
    Number(_user.id)
      )

      const response = {
        id: cliente.id,
        tipo: cliente.tipo,
        nomeCompletoOuRazao: cliente.tipo === 'PF'
          ? (cliente.nomeCompleto || 'Nome não informado')
          : (cliente.nomeFantasia || cliente.razaoSocial || 'Razão social não informada'),
        email: cliente.email,
        telefone: formatTelefone(cliente.telefone || ''),
        cidade: cliente.cidade,
        estado: cliente.estado,
        zipcode: formatZipcode(cliente.zipcode || ''),
        documentoMasked: maskDocumento(cliente.docLast4 || '', cliente.tipo),
        ativo: cliente.status === 'ATIVO',
        criadoEm: cliente.criadoEm.toISOString(),
        atualizadoEm: cliente.atualizadoEm.toISOString()
      }
      return NextResponse.json(response, { status: 200 })
    }

    // Se já existir e estiver ATIVO, bloquear
    if (existingByEmail) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado no sistema' },
        { status: 400 }
      )
    }

    // Criptografar documento para novo cliente
    let documentoEnc: string | null = null
    let docLast4: string | null = null
    let docHash: string | null = null
    if (documentoPlano) {
      const enc = await encryptClienteData(documentoPlano, sanitizedData.tipo)
      documentoEnc = enc.documentoEnc
      docLast4 = enc.docLast4
      docHash = enc.docHash
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        tipo: sanitizedData.tipo,
        nomeCompleto: sanitizedData.nomeCompleto,
        razaoSocial: sanitizedData.razaoSocial,
        nomeFantasia: sanitizedData.nomeFantasia,
        email: sanitizedData.email,
        telefone: sanitizedData.telefone,
        nomeChave: sanitizedData.tipo === 'PF' 
          ? (sanitizedData.nomeCompleto || '')
          : (sanitizedData.nomeFantasia || sanitizedData.razaoSocial || ''),
        documentoEnc,
        docLast4: docLast4 || undefined,
        docHash: docHash || undefined,
        endereco1: sanitizedData.endereco1,
        endereco2: sanitizedData.endereco2,
        cidade: sanitizedData.cidade,
        estado: sanitizedData.estado,
        zipcode: sanitizedData.zipcode,
        observacoes: sanitizedData.observacoes,
        status: 'ATIVO'
      },
      select: {
        id: true,
        tipo: true,
        nomeCompleto: true,
        razaoSocial: true,
        nomeFantasia: true,
        email: true,
        telefone: true,
        cidade: true,
        estado: true,
        zipcode: true,
        docLast4: true,
        status: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })
    
    // Registrar auditoria
    await logClienteAudit(
      cliente.id,
      'CREATE',
      { ...sanitizedData, documento: '[DOCUMENTO]' }, // Não logar documento real
  Number(_user.id)
    )
    
    // Formatar resposta
    const response = {
      id: cliente.id,
      tipo: cliente.tipo,
      nomeCompletoOuRazao: cliente.tipo === 'PF' 
        ? (cliente.nomeCompleto || 'Nome não informado')
        : (cliente.nomeFantasia || cliente.razaoSocial || 'Razão social não informada'),
      email: cliente.email,
      telefone: formatTelefone(cliente.telefone || ''),
      cidade: cliente.cidade,
      estado: cliente.estado,
      zipcode: formatZipcode(cliente.zipcode || ''),
      documentoMasked: maskDocumento(cliente.docLast4 || '', cliente.tipo),
      ativo: cliente.status === 'ATIVO',
      criadoEm: cliente.criadoEm.toISOString(),
      atualizadoEm: cliente.atualizadoEm.toISOString()
    }
    
    return NextResponse.json(response, { status: 201 })
    
  } catch (error) {
    console.error('[API] POST /api/clientes error:', error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      if (error.message === 'UNAUTHENTICATED') {
        return NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        )
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: 'Sem permissão para criar clientes' },
          { status: 403 }
        )
      }
    }
    // Prisma unique constraint (P2002) for duplicate email should map to 409
    // Some test mocks throw an object with code 'P2002'
    const maybeErr = typeof error === 'object' && error !== null ? error as Record<string, unknown> : {}
    if (typeof maybeErr.code === 'string' && maybeErr.code === 'P2002') {
      return NextResponse.json({ error: 'E-mail já está em uso' }, { status: 409 })
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}