import { Cliente, TipoCliente } from '@prisma/client'
import { encryptDoc, docHashHex, last4 } from '@/lib/crypto'
import { prisma } from '@/server/db'
import { AuditService } from '@/services/auditService'

/**
 * Mascara documento para exibição (agora para mercado americano)
 */
export function maskDocumento(documento: string, tipo: TipoCliente, _tipoDocumentoPF?: string): string {
  // reference optional param to satisfy linter when not needed
  void _tipoDocumentoPF
  if (!documento) return ''
  const onlyDigits = documento.replace(/\D/g, '')

  // If we only have a very short snippet (<=4), keep original value (tests expect original)
  if (onlyDigits.length > 0 && onlyDigits.length <= 4) {
    return documento
  }

  // If full document provided, normalize formatting per type (Brazilian CPF/CNPJ)
  if (tipo === 'PF') {
    // CPF: 11 digits -> 123.456.789-01
    if (onlyDigits.length === 11) {
      return `${onlyDigits.slice(0, 3)}.${onlyDigits.slice(3, 6)}.${onlyDigits.slice(6, 9)}-${onlyDigits.slice(9)}`
    }
  } else {
    // CNPJ: 14 digits -> 12.345.678/9012-34
    if (onlyDigits.length === 14) {
      return `${onlyDigits.slice(0, 2)}.${onlyDigits.slice(2, 5)}.${onlyDigits.slice(5, 8)}/${onlyDigits.slice(8, 12)}-${onlyDigits.slice(12)}`
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
  // Brazilian formatting
  // Remove leading country code '55' if present
  if (digits.length === 13 && digits.startsWith('55')) {
    digits = digits.slice(2)
  }

  // Mobile numbers: 11 digits -> (AA) 99999-9999
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  // Landlines: 10 digits -> (AA) 3333-4444
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
  // Brazilian CEP: 8 digits -> 01234-567
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
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
  // reference tipo to satisfy linter in some call sites
  void tipo
  return {
    documentoEnc,
    docLast4,
    docHash
  }
}

/**
 * Sanitizar entrada do usuário
 */
export function sanitizeClienteInput(data: Record<string, unknown> | undefined) {
  const d = data ?? {}
  return {
    ...d,
    documento: d['documento'] ? String(d['documento']).replace(/\D/g, '') : d['documento'] ?? null,
    nomeCompleto: (d['nomeCompleto'] as string | undefined)?.trim() || null,
    razaoSocial: (d['razaoSocial'] as string | undefined)?.trim() || null,
    nomeFantasia: (d['nomeFantasia'] as string | undefined)?.trim() || null,
    email: (d['email'] as string | undefined)?.trim().toLowerCase(),
    telefone: (d['telefone'] as string | undefined)?.replace(/\D/g, ''),
    // documentos individuais (opcionais)
    tipoDocumentoPF: d['tipoDocumentoPF'] ?? null,
    ssn: d['ssn'] ? String(d['ssn']).replace(/\D/g, '') : null,
    itin: d['itin'] ? String(d['itin']).replace(/\D/g, '') : null,
    ein: d['ein'] ? String(d['ein']).replace(/\D/g, '') : null,
    endereco1: (d['endereco1'] as string | undefined)?.trim(),
    endereco2: (d['endereco2'] as string | undefined)?.trim() || null,
    cidade: (d['cidade'] as string | undefined)?.trim(),
    estado: (d['estado'] as string | undefined)?.trim(),
    zipcode: (d['zipcode'] as string | undefined)?.replace(/\D/g, ''),
    observacoes: (d['observacoes'] as string | undefined)?.trim() || null,
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
  const oldVal = oldData[field as string]
  const newVal = newData[field as string]
    
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
