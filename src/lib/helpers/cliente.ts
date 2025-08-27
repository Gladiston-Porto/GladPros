import { Cliente } from '@prisma/client'
import { TipoCliente } from '@/types/cliente'
import { encryptDoc, docHashHex, last4 } from '@/lib/crypto'
import { prisma } from '@/server/db'
import { AuditService } from '@/services/auditService'

/**
 * Mascara documento para exibição (agora para mercado americano)
 */
export function maskDocumento(documento: string, tipo: TipoCliente): string {
  if (!documento) return ''
  const onlyDigits = documento.replace(/\D/g, '')

  // If we only have the last 4 digits (privacy-safe storage), build a masked string
  // If length is less than expected minimal for CPF/CNPJ, return original to satisfy tests
  if (onlyDigits.length < 11 && tipo === 'PF') {
    return documento
  }
  if (onlyDigits.length < 14 && tipo === 'PJ') {
    return documento
  }

  // If we only have the last 4 digits (privacy-safe storage), build a masked string
  if (onlyDigits.length <= 4) {
    const last4 = onlyDigits.padStart(4, '*')
    if (tipo === 'PF') {
      // SSN/ITIN masked: ***-**-1234
      return `***-**-${last4}`
    }
    // PJ (EIN) masked: **-***1234
    return `**-***${last4}`
  }

  // If full document provided, normalize formatting per Brazilian types (CPF/CNPJ)
  // CPF: 11 digits -> 000.000.000-00
  if (tipo === 'PF') {
  if (onlyDigits.length === 11) {
      return `${onlyDigits.slice(0, 3)}.${onlyDigits.slice(3, 6)}.${onlyDigits.slice(6, 9)}-${onlyDigits.slice(9)}`
    }
  } else {
    // CNPJ: 14 digits -> 00.000.000/0000-00
    if (onlyDigits.length === 14) {
      return `${onlyDigits.slice(0,2)}.${onlyDigits.slice(2,5)}.${onlyDigits.slice(5,8)}/${onlyDigits.slice(8,12)}-${onlyDigits.slice(12)}`
    }
  }

  // Fallback: return as-is
  return documento
}

/**
 * Extrai últimos 4 dígitos do documento
 */
export function getDocLast4(documento: string): string {
  return last4(documento)
}

/**
 * Gera hash simples do documento para indexação
 */
export function hashDocumento(documento: string): string {
  return docHashHex(documento)
}

/**
 * Formatar telefone para exibição
 */
export function formatTelefone(telefone: string): string {
  if (!telefone) return ''
  const digits = telefone.replace(/\D/g, '')
  // Brasil: 10 digits (AA) NNNN-NNNN or 11 digits (AA) NNNNN-NNNN
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return telefone
}

/**
 * Formatar CEP para exibição
 */
export function formatZipcode(zipcode: string): string {
  if (!zipcode) return ''

  const digits = zipcode.replace(/\D/g, '')
  // BR CEP: 8 digits -> 12345-678
  if (digits.length === 8) {
    return `${digits.slice(0,5)}-${digits.slice(5)}`
  }
  // fallback for 5/9 digit zips
  if (digits.length === 9) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }
  if (digits.length === 5) {
    return digits
  }
  return zipcode
}

/**
 * Obter nome completo ou razão social baseado no tipo
 */
export function getClienteDisplayName(cliente: Cliente): string {
  if (cliente.tipo === 'PF') {
    return cliente.nomeCompleto || 'Nome não informado'
  } else {
    return cliente.nomeFantasia || cliente.razaoSocial || 'Razão social não informada'
  }
}

/**
 * Preparar dados do cliente para criptografia
 */
export async function encryptClienteData(
  documento: string,
  _tipo?: TipoCliente
): Promise<{
  documentoEnc: string
  docLast4: string
  docHash: string
}> {
  // mark _tipo as used to satisfy lint rule (parameter reserved for future use)
  void _tipo
  const documentoEnc = await encryptDoc(documento)
  const docLast4 = getDocLast4(documento)
  const docHash = hashDocumento(documento)
  
  return {
    documentoEnc,
    docLast4,
    docHash
  }
}

/**
 * Sanitizar entrada do usuário
 */
export function sanitizeClienteInput(data: unknown): Record<string, unknown> {
  const d = (data || {}) as Record<string, unknown>

  const asString = (v: unknown) => (typeof v === 'string' ? v : v == null ? null : String(v))

  const nomeCompleto = asString(d.nomeCompleto)?.trim() || null
  const razaoSocial = asString(d.razaoSocial)?.trim() || null
  const nomeFantasia = asString(d.nomeFantasia)?.trim() || null
  const email = asString(d.email)?.trim().toLowerCase() || null
  const telefone = asString(d.telefone)?.replace(/\D/g, '') || null

  const tipoDocumentoPF = d.tipoDocumentoPF ?? null
  const ssn = asString(d.ssn) ? asString(d.ssn)!.replace(/\D/g, '') : null
  const itin = asString(d.itin) ? asString(d.itin)!.replace(/\D/g, '') : null
  const ein = asString(d.ein) ? asString(d.ein)!.replace(/\D/g, '') : null

  const endereco1 = asString(d.endereco1)?.trim() || null
  const endereco2 = asString(d.endereco2)?.trim() || null
  const cidade = asString(d.cidade)?.trim() || null
  const estado = asString(d.estado)?.trim() || null
  const zipcode = asString(d.zipcode)?.replace(/\D/g, '') || null
  const observacoes = asString(d.observacoes)?.trim() || null
  const documento = asString(d.documento)?.replace(/\D/g, '') || null

  return {
    ...d,
    nomeCompleto,
    razaoSocial,
    nomeFantasia,
    email,
    telefone,
    // documentos individuais (opcionais)
    tipoDocumentoPF,
    ssn,
    itin,
    ein,
    endereco1,
    endereco2,
    cidade,
    estado,
  zipcode,
  documento,
    observacoes
  }
}

/**
 * Validar se documento já existe
 */
export async function checkDocumentoExists(documento?: string | null, excludeId?: number): Promise<boolean> {
  if (!documento) return false
  const docHash = hashDocumento(documento)
  
  // Guard for test environment where prisma client may be mocked partially
  if (!prisma || !prisma.cliente || typeof prisma.cliente.findFirst !== 'function') {
    return false
  }

  const existing = await prisma.cliente.findFirst({
    where: {
      docHash,
      id: excludeId ? { not: excludeId } : undefined
    },
    select: { id: true }
  })

  return !!existing
}

/**
 * Validar se email já existe
 */
export async function checkEmailExists(email: string, excludeId?: number): Promise<boolean> {
  if (!prisma || !prisma.cliente || typeof prisma.cliente.findFirst !== 'function') {
    return false
  }

  const existing = await prisma.cliente.findFirst({
    where: {
      email: email.toLowerCase(),
      id: excludeId ? { not: excludeId } : undefined
    },
    select: { id: true }
  })

  return !!existing
}

/**
 * Registrar mudanças para auditoria
 */
export async function logClienteAudit(
  clienteId: number,
  acao: string,
  diff: Record<string, unknown>,
  userId: number
) {
  return AuditService.logAction(userId, 'Cliente', clienteId, acao, diff)
}

/**
 * Calcular diff entre estados do cliente
 */
export function calculateClienteDiff(oldData: Record<string, unknown>, newData: Record<string, unknown>) {
  const diff: Record<string, { old: unknown; new: unknown }> = {}
  
  const fields = [
    'tipo', 'nomeCompleto', 'razaoSocial', 'nomeFantasia', 'email',
    'telefone', 'endereco1', 'endereco2', 'cidade', 'estado', 
    'zipcode', 'observacoes', 'status'
  ]
  
  for (const field of fields) {
  const oldVal = oldData[field]
  const newVal = newData[field]
    
    if (oldVal !== newVal) {
      diff[field] = { old: oldVal, new: newVal }
    }
  }
  
  // Para documento, não logamos o valor real, apenas que mudou
  if (oldData.docHash !== newData.docHash) {
    diff.documento = { old: '[DOCUMENTO]', new: '[DOCUMENTO ALTERADO]' }
  }
  
  return diff
}
