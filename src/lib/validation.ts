import { z } from 'zod';

// Validações base
export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(128, 'Senha muito longa')
  .refine((password) => {
    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) return false;
    // Pelo menos uma letra maiúscula ou número
    if (!/[A-Z0-9]/.test(password)) return false;
    return true;
  }, 'Senha deve conter pelo menos: 1 letra minúscula e 1 maiúscula ou número');

export const userNameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .trim()
  .refine((name) => {
    // Permitir apenas letras, espaços e acentos
    return /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
  }, 'Nome deve conter apenas letras e espaços');

export const pinSchema = z
  .string()
  .length(4, 'PIN deve ter exatamente 4 dígitos')
  .refine((pin) => /^\d{4}$/.test(pin), 'PIN deve conter apenas números');

export const mfaCodeSchema = z
  .string()
  .length(6, 'Código MFA deve ter exatamente 6 dígitos')
  .refine((code) => /^\d{6}$/.test(code), 'Código MFA deve conter apenas números');

export const securityQuestionSchema = z
  .string()
  .min(5, 'Pergunta de segurança muito curta')
  .max(200, 'Pergunta de segurança muito longa')
  .trim();

export const securityAnswerSchema = z
  .string()
  .min(2, 'Resposta muito curta')
  .max(100, 'Resposta muito longa')
  .trim()
  .toLowerCase();

// Schemas para APIs
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória')
});

export const mfaVerificationSchema = z.object({
  userId: z.number().int().positive('ID do usuário inválido'),
  code: mfaCodeSchema,
  tipoAcao: z.enum(['LOGIN', 'PRIMEIRO_ACESSO', 'RESET_PASSWORD']).optional()
});

export const mfaRequestSchema = z.object({
  email: emailSchema
});

export const firstAccessSetupSchema = z.object({
  userId: z.number().int().positive('ID do usuário inválido'),
  novaSenha: passwordSchema,
  pin: pinSchema,
  perguntaSeguranca: securityQuestionSchema,
  respostaSeguranca: securityAnswerSchema
});

// Schemas específicos para as rotas atuais (nomes dos campos usados no front)
export const firstAccessSetupApiSchema = z.object({
  userId: z.number().int().positive('ID do usuário inválido'),
  newPassword: passwordSchema,
  pin: pinSchema,
  securityQuestion: securityQuestionSchema,
  securityAnswer: securityAnswerSchema
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  novaSenha: passwordSchema
});

export const resetPasswordApiSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  senha: passwordSchema
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const userStatusSchema = z.object({
  email: emailSchema
});

export const userCreationSchema = z.object({
  nomeCompleto: userNameSchema,
  email: emailSchema,
  tipo: z.enum(['ADMIN', 'USUARIO', 'CLIENTE']),
  departamento: z.string().max(100, 'Departamento muito longo').optional(),
  cargo: z.string().max(100, 'Cargo muito longo').optional()
});

export const userUpdateSchema = z.object({
  nomeCompleto: userNameSchema.optional(),
  email: emailSchema.optional(),
  tipo: z.enum(['ADMIN', 'USUARIO', 'CLIENTE']).optional(),
  departamento: z.string().max(100, 'Departamento muito longo').optional(),
  cargo: z.string().max(100, 'Cargo muito longo').optional(),
  status: z.enum(['ATIVO', 'INATIVO', 'SUSPENSO']).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'Pelo menos um campo deve ser fornecido para atualização'
);

export const unlockSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('pin'),
    userId: z.number().int().positive('ID do usuário inválido'),
    pin: pinSchema
  }),
  z.object({
    method: z.literal('security'),
    userId: z.number().int().positive('ID do usuário inválido'),
    answer: securityAnswerSchema
  })
]);

export const mfaResendSchema = z.object({
  userId: z.number().int().positive('ID do usuário inválido'),
  // Aceitar valores usados no front e no serviço; mapearemos para o enum do serviço
  tipoAcao: z.enum(['LOGIN', 'PRIMEIRO_ACESSO', 'RESET_PASSWORD', 'RESET', 'DESBLOQUEIO']).optional()
});

// Export PDF payload
export const exportUserSchema = z.object({
  nomeCompleto: z.string().optional(),
  email: emailSchema,
  role: z.string().optional(),
  ativo: z.boolean().optional(),
  criadoEm: z.union([z.string(), z.number(), z.date()]).optional()
});

export const exportUsersPdfSchema = z.object({
  filename: z.string().min(1).max(128).optional(),
  users: z.array(exportUserSchema).min(1)
});

// Users API: update schema with optional fields and light validation
export const userUpdateApiSchema = z.object({
  email: emailSchema.optional(),
  nomeCompleto: userNameSchema.optional(),
  role: z.enum(['ADMIN', 'GERENTE', 'USUARIO', 'FINANCEIRO', 'ESTOQUE', 'CLIENTE']).optional(),
  status: z.enum(['ATIVO', 'INATIVO']).optional(),
  telefone: z
    .string()
    .max(32)
    .optional()
    .or(z.literal(''))
    .transform((s) => (s ? s : undefined))
    .refine((v) => {
      if (!v) return true;
      const digits = v.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 11;
    }, 'Telefone deve ter entre 10 e 11 dígitos. Exemplo: (11)99999-9999'),
  dataNascimento: z
    .union([z.string(), z.date()])
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      if (v instanceof Date) {
        if (isNaN(v.getTime())) return undefined;
        const yyyy = v.getFullYear();
        const mm = String(v.getMonth() + 1).padStart(2, '0');
        const dd = String(v.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      const s = String(v).trim();
      const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (mIso) return s;
      const mUs = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mUs) {
        const [, mm, dd, yyyy] = mUs as unknown as [string, string, string, string];
        const dayNum = parseInt(dd, 10);
        const monthNum = parseInt(mm, 10);
        if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
          return 'INVALID_DATE';
        }
        const ddPad = dd.padStart(2, '0');
        const mmPad = mm.padStart(2, '0');
        return `${yyyy}-${mmPad}-${ddPad}`;
      }
      return 'INVALID_DATE';
    })
    .refine((dateStr) => {
      if (!dateStr) return true;
      if (dateStr === 'INVALID_DATE') return false;
      const date = new Date(dateStr + 'T00:00:00.000Z');
      return !isNaN(date.getTime());
    }, 'Data de nascimento inválida. Use o formato MM/DD/YYYY (ex: 05/18/1979)'),
  endereco1: z.string().max(191).optional().or(z.literal('')).transform((s) => (s ? s : undefined)),
  endereco2: z.string().max(191).optional().or(z.literal('')).transform((s) => (s ? s : undefined)),
  cidade: z.string().max(96).optional().or(z.literal('')).transform((s) => (s ? s : undefined)),
  estado: z.string().max(32).optional().or(z.literal('')).transform((s) => (s ? s : undefined)),
  cep: z
    .string()
    .max(16)
    .optional()
    .or(z.literal(''))
    .transform((s) => (s ? s : undefined))
    .refine((v) => {
      if (!v) return true;
      const digits = v.replace(/\D/g, '');
      return digits.length >= 5 && digits.length <= 9 && digits === v.replace(/\D/g, '');
    }, 'CEP deve conter apenas números. Exemplo: 01234567'),
  anotacoes: z.string().optional().or(z.literal('')).transform((s) => (s && s.trim().length > 0 ? s : undefined))
});

export const toggleUserStatusSchema = z.object({
  ativo: z.boolean()
});

// Utilitários de sanitização
export class Sanitizer {
  // Sanitizar strings para prevenir XSS
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remover < e >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }

  // Sanitizar HTML removendo tags perigosas
  static sanitizeHtml(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Sanitizar input para SQL (adicional ao Prisma)
  static sanitizeSql(input: string): string {
    return input
      .replace(/['\";]/g, '') // Remover aspas e ponto e vírgula
      .replace(/(-{2,}|\/\*|\*\/)/g, '') // Remover comentários SQL
      .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, ''); // Remover palavras-chave SQL
  }

  // Validar e sanitizar número de telefone
  static sanitizePhone(input: string): string {
    return input
      .replace(/[^\d+()-\s]/g, '') // Manter apenas dígitos e caracteres válidos
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();
  }

  // Validar e sanitizar CPF/CNPJ
  static sanitizeDocument(input: string): string {
    return input.replace(/[^\d]/g, ''); // Manter apenas dígitos
  }
}

// Middleware de validação para Next.js
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
      }
      return {
        success: false,
        errors: [{ field: 'general', message: 'Dados inválidos' }]
      };
    }
  };
}

// Headers de segurança
export const securityHeaders = {
  // Prevenção de XSS
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Content Security Policy básico
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; '),
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
