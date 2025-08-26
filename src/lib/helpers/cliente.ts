import { Cliente, TipoCliente, Usuario } from '@prisma/client'
import { encryptDoc, docHashHex, last4 } from '@/lib/crypto'
import { prisma } from '@/server/db'
import { AuditService } from '@/services/auditService'

/**
 * Mascara documento para exibição (agora para mercado americano)
 */
export function maskDocumento(documento: string, tipo: TipoCliente, tipoDocumentoPF?: string): string {
  if (!documento) return ''
  const onlyDigits = documento.replace(/\D/g, '')

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

  // If full document provided, normalize formatting per type
  if (tipo === 'PF') {
    // SSN or ITIN share same 3-2-4 formatting; ITINs always start with 9
    if (onlyDigits.length === 9) {
      return `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3, 5)}-${onlyDigits.slice(5)}`
    }
  } else {
    // EIN: 2-7 formatting
    if (onlyDigits.length === 9) {
      return `${onlyDigits.slice(0, 2)}-${onlyDigits.slice(2)}`
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

  let digits = telefone.replace(/\D/g, '')
  // Handle US numbers: optionally strip leading country code 1
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }
  if (digits.length === 10) {
    // (AAA) BBB-CCCC
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return telefone
}

/**
 * Formatar CEP para exibição
 */
export function formatZipcode(zipcode: string): string {
  if (!zipcode) return ''

  const digits = zipcode.replace(/\D/g, '')
  // US ZIP: 5 or 9 (ZIP+4)
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
  tipo: TipoCliente
): Promise<{
  documentoEnc: string
  docLast4: string
  docHash: string
}> {
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
export function sanitizeClienteInput(data: any) {
  return {
    ...data,
    nomeCompleto: data.nomeCompleto?.trim() || null,
    razaoSocial: data.razaoSocial?.trim() || null,
    nomeFantasia: data.nomeFantasia?.trim() || null,
    email: data.email?.trim().toLowerCase(),
    telefone: data.telefone?.replace(/\D/g, ''),
  // documentos individuais (opcionais)
  tipoDocumentoPF: data.tipoDocumentoPF ?? null,
  ssn: data.ssn ? String(data.ssn).replace(/\D/g, '') : null,
  itin: data.itin ? String(data.itin).replace(/\D/g, '') : null,
  ein: data.ein ? String(data.ein).replace(/\D/g, '') : null,
    endereco1: data.endereco1?.trim(),
    endereco2: data.endereco2?.trim() || null,
    cidade: data.cidade?.trim(),
    estado: data.estado?.trim(),
    zipcode: data.zipcode?.replace(/\D/g, ''),
    observacoes: data.observacoes?.trim() || null
  }
}

/**
 * Validar se documento já existe
 */
export async function checkDocumentoExists(documento?: string | null, excludeId?: number): Promise<boolean> {
  if (!documento) return false
  const docHash = hashDocumento(documento)
  
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
  diff: Record<string, any>,
  userId: number
) {
  return AuditService.logAction(userId, 'Cliente', clienteId, acao, diff)
}

/**
 * Calcular diff entre estados do cliente
 */
export function calculateClienteDiff(oldData: any, newData: any) {
  const diff: Record<string, { old: any; new: any }> = {}
  
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
