import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { requireClientePermission, ClientePermissions } from '@/lib/rbac'
import { clienteUpdateSchema, clienteParamsSchema } from '@/lib/validations/cliente'
import {
  sanitizeClienteInput,
  encryptClienteData,
  checkDocumentoExists,
  logClienteAudit,
  calculateClienteDiff,
  formatTelefone,
  formatZipcode,
  maskDocumento
} from '@/lib/helpers/cliente'
import { decryptDoc } from '@/lib/crypto'
import { ZodError } from 'zod'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar permissão de leitura
    const user = await requireClientePermission(request, 'canRead')
    
    // Validar parâmetros
  const { id } = clienteParamsSchema.parse(await ctx.params)
    
    // Buscar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        tipo: true,
        nomeCompleto: true,
        razaoSocial: true,
        nomeFantasia: true,
        email: true,
        telefone: true,
        nomeChave: true,
        endereco1: true,
        endereco2: true,
        cidade: true,
        estado: true,
        zipcode: true,
        status: true,
        documentoEnc: true,
        docLast4: true,
        observacoes: true,
        criadoEm: true,
        atualizadoEm: true
      }
    })
    
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    // Preparar resposta base
  const response: Record<string, unknown> = {
      id: cliente.id,
      tipo: cliente.tipo,
      nomeCompleto: cliente.nomeCompleto,
      razaoSocial: cliente.razaoSocial,
      nomeFantasia: cliente.nomeFantasia,
      email: cliente.email,
      telefone: formatTelefone(cliente.telefone || ''),
      endereco1: cliente.endereco1,
      endereco2: cliente.endereco2,
      cidade: cliente.cidade,
      estado: cliente.estado,
      zipcode: formatZipcode(cliente.zipcode || ''),
      observacoes: cliente.observacoes,
      ativo: cliente.status === 'ATIVO',
      documentoMasked: maskDocumento(cliente.docLast4 || '', cliente.tipo),
      criadoEm: cliente.criadoEm.toISOString(),
      atualizadoEm: cliente.atualizadoEm.toISOString()
    }
    
    // Se usuário tem permissão para ver documentos, descriptografar
    if (ClientePermissions.canViewDocuments(user.role) && cliente.documentoEnc) {
      try {
        response.documento = await decryptDoc(cliente.documentoEnc)
      } catch (error) {
        console.warn('Erro ao descriptografar documento:', error)
        // Não falha a operação, apenas não retorna o documento
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('[API] GET /api/clientes/[id] error:', error)
    
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
          { error: 'Sem permissão para visualizar cliente' },
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
 * PUT /api/clientes/[id] - Atualizar cliente
 */
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar permissão de atualização
    const user = await requireClientePermission(request, 'canUpdate')
    
    // Validar parâmetros
  const { id } = clienteParamsSchema.parse(await ctx.params)
    
    // Obter dados do body
    const body = await request.json()
    
    // Validar dados
    const validData = clienteUpdateSchema.parse(body)
    
    // Sanitizar entrada (narrow local type)
    type SanitizedClienteUpdate = {
      tipo?: 'PF' | 'PJ'
      ssn?: string
      itin?: string
      ein?: string
      documento?: string
      email?: string
      nomeCompleto?: string | null
      razaoSocial?: string | null
      nomeFantasia?: string | null
      telefone?: string
      endereco1?: string | null
      endereco2?: string | null
      cidade?: string | null
      estado?: string | null
      zipcode?: string | null
      observacoes?: string | null
    }
    
    const sanitizedData = sanitizeClienteInput(validData) as SanitizedClienteUpdate
    // Buscar cliente atual
    const clienteAtual = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        tipo: true,
        nomeCompleto: true,
        razaoSocial: true,
        nomeFantasia: true,
        email: true,
        telefone: true,
        endereco1: true,
        endereco2: true,
        cidade: true,
        estado: true,
        zipcode: true,
        status: true,
        docHash: true,
        observacoes: true
      }
    })
    
    if (!clienteAtual) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    // Preparar dados para atualização
  const updateData: Record<string, unknown> = {}
    
    // Campos simples
    const simpleFields = [
      'nomeCompleto', 'razaoSocial', 'nomeFantasia', 'email', 'telefone',
      'endereco1', 'endereco2', 'cidade', 'estado', 'zipcode', 'observacoes'
    ]
    
    for (const field of simpleFields) {
      if (field in (sanitizedData as Record<string, unknown>) && (sanitizedData as Record<string, unknown>)[field] !== undefined) {
        updateData[field] = (sanitizedData as Record<string, unknown>)[field]
      }
    }
    
    // Atualizar nomeChave se nome/nome fantasia mudou
    if (sanitizedData.nomeCompleto || sanitizedData.razaoSocial || sanitizedData.nomeFantasia) {
      updateData.nomeChave = sanitizedData.nomeCompleto || sanitizedData.nomeFantasia || sanitizedData.razaoSocial || clienteAtual.nomeCompleto || clienteAtual.razaoSocial || ''
    }
    
    // Atualizar status se fornecido
    if ('ativo' in validData && validData.ativo !== undefined) {
      updateData.status = validData.ativo ? 'ATIVO' : 'INATIVO'
    }
    
    // Verificar unicidade de email se mudou
    if (sanitizedData.email && sanitizedData.email !== clienteAtual.email) {
      // Checar se já existe algum cliente (exceto o atual) com o mesmo email
      const conflicting = await prisma.cliente.findFirst({
        where: {
          email: sanitizedData.email,
          id: { not: id }
        },
        select: { id: true, status: true }
      })

      if (conflicting) {
        if (conflicting.status === 'INATIVO') {
          // Liberar o email renomeando o registro inativo com um sufixo único
          if (typeof sanitizedData.email === 'string') {
            const [local, domain] = sanitizedData.email.split('@')
            const archivedEmail = `${local}+inativo-${conflicting.id}@${domain}`
            await prisma.cliente.update({
              where: { id: conflicting.id },
              data: { email: archivedEmail }
            })
          }
        } else {
          return NextResponse.json(
            { error: 'E-mail já cadastrado no sistema' },
            { status: 400 }
          )
        }
      }
    }
    
    // Verificar e criptografar documento se mudou (aceita ssn/itin/ein opcionais)
    let documentoAtualizado: string | undefined
    if (sanitizedData.documento) {
      documentoAtualizado = sanitizedData.documento
    } else {
      // Consolidar a partir de campos específicos, se fornecidos
      if (sanitizedData.ssn) documentoAtualizado = sanitizedData.ssn
      else if (sanitizedData.itin) documentoAtualizado = sanitizedData.itin
      else if (sanitizedData.ein) documentoAtualizado = sanitizedData.ein
    }

    if (documentoAtualizado) {
      const documentoExists = await checkDocumentoExists(documentoAtualizado, id)
      if (documentoExists) {
        return NextResponse.json(
          { error: 'Documento já cadastrado no sistema' },
          { status: 400 }
        )
      }
      
      // Criptografar novo documento
      const { documentoEnc, docLast4, docHash } = await encryptClienteData(
        documentoAtualizado,
        sanitizedData.tipo || clienteAtual.tipo
      )
      
      updateData.documentoEnc = documentoEnc
      updateData.docLast4 = docLast4
      updateData.docHash = docHash
    }
    
    // Atualizar no banco
    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: updateData,
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
    
    // Calcular diff para auditoria
    const diff = calculateClienteDiff(
      clienteAtual,
      { ...sanitizedData, status: updateData.status }
    )
    
    // Registrar auditoria se houve mudanças
    if (Object.keys(diff).length > 0) {
      await logClienteAudit(
        id,
        'UPDATE',
        diff,
        Number(user.id)
      )
    }
    
    // Formatar resposta
    const response = {
      id: clienteAtualizado.id,
      tipo: clienteAtualizado.tipo,
      nomeCompletoOuRazao: clienteAtualizado.tipo === 'PF' 
        ? (clienteAtualizado.nomeCompleto || 'Nome não informado')
        : (clienteAtualizado.nomeFantasia || clienteAtualizado.razaoSocial || 'Razão social não informada'),
      email: clienteAtualizado.email,
      telefone: formatTelefone(clienteAtualizado.telefone || ''),
      cidade: clienteAtualizado.cidade,
      estado: clienteAtualizado.estado,
      zipcode: formatZipcode(clienteAtualizado.zipcode || ''),
      documentoMasked: maskDocumento(clienteAtualizado.docLast4 || '', clienteAtualizado.tipo),
      ativo: clienteAtualizado.status === 'ATIVO',
      criadoEm: clienteAtualizado.criadoEm.toISOString(),
      atualizadoEm: clienteAtualizado.atualizadoEm.toISOString()
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('[API] PUT /api/clientes/[id] error:', error)

    // Tratar violações de unicidade (P2002) com mensagens amigáveis
      const anyErr = error as unknown
      if (anyErr && typeof anyErr === 'object') {
        const ae = anyErr as Record<string, unknown>
        const code = ae.code as string | undefined
        if (code === 'P2002') {
          const target = (ae.meta as Record<string, unknown> | undefined)?.target
          let message = 'Dados duplicados'
          if (Array.isArray(target)) {
            if ((target as string[]).includes('email')) message = 'E-mail já cadastrado no sistema'
            else if ((target as string[]).includes('docHash')) message = 'Documento já cadastrado no sistema'
            else if ((target as string[]).includes('nomeChave') && (target as string[]).includes('telefone')) message = 'Já existe cliente com o mesmo nome e telefone'
          } else if (typeof target === 'string') {
            if (target.includes('email')) message = 'E-mail já cadastrado no sistema'
            else if (target.includes('docHash')) message = 'Documento já cadastrado no sistema'
            else if (target.includes('nomeChave') && target.includes('telefone')) message = 'Já existe cliente com o mesmo nome e telefone'
          }
          return NextResponse.json({ error: message }, { status: 400 })
        }
      }
    
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
          { error: 'Sem permissão para atualizar cliente' },
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
 * DELETE /api/clientes/[id] - Inativar cliente (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar permissão de deleção
    const user = await requireClientePermission(request, 'canDelete')
    
    // Validar parâmetros
  const { id } = clienteParamsSchema.parse(await ctx.params)
    
    // Buscar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      select: { id: true, status: true, nomeCompleto: true, razaoSocial: true }
    })
    
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }
    
    if (cliente.status === 'INATIVO') {
      // Tornar idempotente: já está inativo, retornar 200
      await logClienteAudit(
        id,
        'DELETE',
        { status: { old: 'INATIVO', new: 'INATIVO' } },
        Number(user.id)
      )
      return NextResponse.json({ 
        message: 'Cliente já estava inativo',
        id
      })
    }
    
    // Inativar cliente
    await prisma.cliente.update({
      where: { id },
      data: { status: 'INATIVO' }
    })
    
    // Registrar auditoria
    await logClienteAudit(
      id,
      'DELETE',
      { status: { old: 'ATIVO', new: 'INATIVO' } },
      Number(user.id)
    )
    
    return NextResponse.json({ 
      message: 'Cliente inativado com sucesso',
      id
    })
    
  } catch (error) {
    console.error('[API] DELETE /api/clientes/[id] error:', error)
    
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
          { error: 'Sem permissão para inativar cliente' },
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
 * PATCH /api/clientes/[id] - Alternar status (ativar/inativar)
 */
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar permissão de atualização
    const user = await requireClientePermission(request, 'canUpdate')

    // Validar parâmetros
    const { id } = clienteParamsSchema.parse(await ctx.params)

    // Obter body
    const body = await request.json().catch(() => ({}))
    const ativo = typeof body?.ativo === 'boolean' ? body.ativo : undefined
    if (ativo === undefined) {
      return NextResponse.json(
        { error: 'Parâmetro "ativo" é obrigatório e deve ser booleano' },
        { status: 400 }
      )
    }

    // Buscar cliente atual
    const clienteAtual = await prisma.cliente.findUnique({
      where: { id },
      select: { id: true, status: true }
    })
    if (!clienteAtual) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    const novoStatus = ativo ? 'ATIVO' : 'INATIVO'
    if (clienteAtual.status === novoStatus) {
      // Idempotente
      return NextResponse.json({ id, ativo, message: 'Status já estava definido' })
    }

    // Atualizar
    const atualizado = await prisma.cliente.update({
      where: { id },
      data: { status: novoStatus }
    })

    // Auditoria
    await logClienteAudit(
      id,
      'UPDATE',
      { status: { old: clienteAtual.status, new: novoStatus } },
      Number(user.id)
    )

    return NextResponse.json({ id: atualizado.id, ativo: atualizado.status === 'ATIVO' })
  } catch (error) {
    console.error('[API] PATCH /api/clientes/[id] error:', error)
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
          { error: 'Sem permissão para atualizar status de cliente' },
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
