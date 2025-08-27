import { z } from 'zod'

// Validações base
const telefoneRegex = /^(?:\+?\d[\d\s\-\(\)]{9,14})$/
// Accept common ZIP/CEP formats including Brazilian 5-3 (01310-100), 8 digits, US 5 or 5-4, or 5-9
const zipCodeRegex = /^(\d{5}|\d{5}-\d{4}|\d{5}-\d{3}|\d{8}|\d{5,9})$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validações para mercado americano
const ssnRegex = /^\d{3}-\d{2}-\d{4}$|^\d{9}$/ // Format: 123-45-6789 or 123456789
const itinRegex = /^9\d{2}-\d{2}-\d{4}$|^9\d{8}$/ // ITIN starts with 9, format: 9XX-XX-XXXX
const einRegex = /^\d{2}-\d{7}$|^\d{9}$/ // Format: 12-3456789 or 123456789

// Schema para criação de cliente
export const clienteCreateSchema = z.object({
  tipo: z.enum(['PF', 'PJ'], {
    message: 'Tipo deve ser PF ou PJ'
  }),
  
  // Campos condicionais baseados no tipo
  nomeCompleto: z.string().min(1, 'Nome completo é obrigatório').max(255).optional().nullable(),
  razaoSocial: z.string().max(255).optional().nullable(),
  nomeFantasia: z.string().max(255).optional().nullable(),
  
  // Campos obrigatórios
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .regex(emailRegex, 'E-mail deve ter formato válido')
    .max(255),
    
  telefone: z.string()
    .min(1, 'Telefone é obrigatório')
    .regex(telefoneRegex, 'Telefone deve ter formato válido')
    .transform(val => val.replace(/\D/g, '')), // Remove máscaras
    
  // Campos para mercado americano
  tipoDocumentoPF: z.enum(['SSN', 'ITIN']).optional().nullable(),
  ssn: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(ssnRegex, 'SSN deve ter formato válido (123-45-6789)').optional().nullable()),
  itin: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(itinRegex, 'ITIN deve ter formato válido (9XX-XX-XXXX)').optional().nullable()),
  ein: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(einRegex, 'EIN deve ter formato válido (12-3456789)').optional().nullable()),
    
  // Endereço
  endereco1: z.string().max(255).optional().nullable(),
  endereco2: z.string().max(255).optional().nullable(),
  cidade: z.string().max(96).optional().nullable(),
  estado: z.string().max(32).optional().nullable(),
  zipcode: z.preprocess((v) => (v === '' ? undefined : v), z.string()
    .regex(zipCodeRegex, 'CEP/ZIP deve ter formato válido')
    .transform(val => val.replace(/\D/g, ''))
    .optional()
    .nullable()),
    
  observacoes: z.string().max(1000).optional().nullable()
}).refine((data) => {
  // Validação condicional: PF precisa de nomeCompleto, PJ precisa de razaoSocial
  if (data.tipo === 'PF') {
    return !!(data.nomeCompleto && data.nomeCompleto.trim().length > 0)
  }
  if (data.tipo === 'PJ') {
    // Para PJ exigimos Nome da Empresa (nomeFantasia); razão social é opcional
    return !!(data.nomeFantasia && data.nomeFantasia.trim().length > 0)
  }
  return true
}, {
  message: 'Para PF o nome completo é obrigatório, para PJ o nome da empresa é obrigatório',
  path: ['tipo']
}).refine((data) => {
  // Validação OPCIONAL para documentos americanos (apenas formato se fornecido)
  if (data.tipo === 'PF' && data.tipoDocumentoPF) {
    if (data.tipoDocumentoPF === 'SSN' && data.ssn) {
      return /^\d{3}-\d{2}-\d{4}$|^\d{9}$/.test(data.ssn)
    }
    if (data.tipoDocumentoPF === 'ITIN' && data.itin) {
      return /^9\d{2}-\d{2}-\d{4}$|^9\d{8}$/.test(data.itin)
    }
  }
  if (data.tipo === 'PJ' && data.ein) {
    return /^\d{2}-\d{7}$|^\d{9}$/.test(data.ein)
  }
  return true
}, {
  message: 'Documentos devem ter formato válido quando fornecidos',
  path: ['tipo']
})

// Schema para atualização (todos os campos opcionais exceto tipo)
export const clienteUpdateSchema = z.object({
  tipo: z.enum(['PF', 'PJ']).optional(),
  ativo: z.boolean().optional(),
  nomeCompleto: z.string().max(255).optional().nullable(),
  razaoSocial: z.string().max(255).optional().nullable(),
  nomeFantasia: z.string().max(255).optional().nullable(),
  email: z.string().regex(emailRegex, 'E-mail deve ter formato válido').max(255).optional(),
  telefone: z.string().regex(telefoneRegex, 'Telefone deve ter formato válido').optional(),
  tipoDocumentoPF: z.enum(['SSN', 'ITIN']).optional().nullable(),
  ssn: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(ssnRegex, 'SSN deve ter formato válido (123-45-6789)').optional().nullable()),
  itin: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(itinRegex, 'ITIN deve ter formato válido (9XX-XX-XXXX)').optional().nullable()),
  ein: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(einRegex, 'EIN deve ter formato válido (12-3456789)').optional().nullable()),
  endereco1: z.string().max(255).optional().nullable(),
  endereco2: z.string().max(255).optional().nullable(),
  cidade: z.string().max(96).optional().nullable(),
  estado: z.string().max(32).optional().nullable(),
  zipcode: z.preprocess((v) => (v === '' ? undefined : v), z.string()
    .regex(zipCodeRegex, 'CEP/ZIP deve ter formato válido')
    .transform(val => val.replace(/\D/g, ''))
    .optional()
    .nullable()),
  observacoes: z.string().max(1000).optional().nullable(),
}).refine((data) => {
  // Validação condicional para updates também
  if (data.tipo === 'PF' && data.nomeCompleto !== undefined) {
    return !data.nomeCompleto || data.nomeCompleto.trim().length > 0
  }
  if (data.tipo === 'PJ' && data.nomeFantasia !== undefined) {
    return !data.nomeFantasia || data.nomeFantasia.trim().length > 0
  }
  return true
}, {
  message: 'Nome completo (PF) ou nome da empresa (PJ) não podem ser vazios se fornecidos',
  path: ['tipo']
}).refine((data) => {
  // Validação de documentos em updates
  if (data.tipo === 'PF') {
    if (data.tipoDocumentoPF) {
      if (data.tipoDocumentoPF === 'SSN' && data.ssn !== undefined) {
        return !data.ssn || /^\d{3}-\d{2}-\d{4}$|^\d{9}$/.test(data.ssn)
      }
      if (data.tipoDocumentoPF === 'ITIN' && data.itin !== undefined) {
        return !data.itin || /^9\d{2}-\d{2}-\d{4}$|^9\d{8}$/.test(data.itin)
      }
    }
  }
  if (data.tipo === 'PJ' && data.ein !== undefined) {
    return !data.ein || /^\d{2}-\d{7}$|^\d{9}$/.test(data.ein)
  }
  return true
}, {
  message: 'Documentos devem ter formato válido',
  path: ['tipo']
}).transform((data) => {
  // Transform telefone for update
  if (data.telefone !== undefined) {
    if (data.telefone === '' || data.telefone === null) {
      data.telefone = undefined
    } else {
      data.telefone = String(data.telefone).replace(/\D/g, '')
      if (!/^\d{7,15}$/.test(data.telefone)) {
        throw new Error('Telefone deve ter entre 7 e 15 dígitos')
      }
    }
  }
  return data
})

// Schema para filtros
export const clienteFiltersSchema = z.object({
  q: z.string().optional(),
  tipo: z.enum(['PF', 'PJ', 'all']).optional().default('all'),
  ativo: z.union([z.coerce.boolean(), z.literal('all')]).optional().default('all'),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(2000).optional().default(10),
  // Ordenação server-side
  sortKey: z.enum(['nome', 'tipo', 'email', 'telefone', 'documento', 'cidadeEstado', 'status']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional()
})

// Schema para parâmetros de rota
export const clienteParamsSchema = z.object({
  id: z.coerce.number().int().positive()
})

// Tipos inferidos dos schemas
export type ClienteCreateInput = z.infer<typeof clienteCreateSchema>
export type ClienteUpdateInput = z.infer<typeof clienteUpdateSchema>
export type ClienteFiltersInput = z.infer<typeof clienteFiltersSchema>
export type ClienteParamsInput = z.infer<typeof clienteParamsSchema>

// Schema para resposta da API
export const clienteResponseSchema = z.object({
  id: z.number(),
  tipo: z.enum(['PF', 'PJ']),
  nomeCompletoOuRazao: z.string(),
  email: z.string(),
  telefone: z.string(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  zipcode: z.string().nullable(),
  documentoMasked: z.string(),
  ativo: z.boolean(),
  criadoEm: z.string(),
  atualizadoEm: z.string()
})

export const clienteListResponseSchema = z.object({
  data: z.array(clienteResponseSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number()
})
