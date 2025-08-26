import {
  maskDocumento,
  formatTelefone,
  formatZipcode,
  getClienteDisplayName,
  getDocLast4,
  hashDocumento,
  sanitizeClienteInput,
  calculateClienteDiff
} from '@/lib/helpers/cliente'
import { TipoCliente, Cliente } from '@prisma/client'

describe('Cliente Helpers - Complete', () => {
  describe('maskDocumento', () => {
    it('should mask CPF correctly', () => {
      expect(maskDocumento('12345678901', 'PF')).toBe('123.456.789-01')
    })

    it('should mask CNPJ correctly', () => {
      expect(maskDocumento('12345678901234', 'PJ')).toBe('12.345.678/9012-34')
    })

    it('should handle empty document', () => {
      expect(maskDocumento('', 'PF')).toBe('')
    })

    it('should return original if invalid length', () => {
      expect(maskDocumento('123', 'PF')).toBe('123')
      expect(maskDocumento('123', 'PJ')).toBe('123')
    })
  })

  describe('formatTelefone', () => {
    it('should format 11-digit phone number', () => {
      expect(formatTelefone('11999999999')).toBe('(11) 99999-9999')
    })

    it('should format 10-digit phone number', () => {
      expect(formatTelefone('1133334444')).toBe('(11) 3333-4444')
    })

    it('should handle empty string', () => {
      expect(formatTelefone('')).toBe('')
    })

    it('should handle invalid format', () => {
      expect(formatTelefone('123')).toBe('123')
    })
  })

  describe('formatZipcode', () => {
    it('should format valid zipcode', () => {
      expect(formatZipcode('01234567')).toBe('01234-567')
    })

    it('should handle empty string', () => {
      expect(formatZipcode('')).toBe('')
    })

    it('should handle invalid format', () => {
      expect(formatZipcode('123')).toBe('123')
    })
  })

  describe('getClienteDisplayName', () => {
    it('should return nomeCompleto for PF', () => {
      const cliente = {
        tipo: 'PF' as TipoCliente,
        nomeCompleto: 'João Silva',
        nomeFantasia: null,
        razaoSocial: null
      } as Cliente

      expect(getClienteDisplayName(cliente)).toBe('João Silva')
    })

    it('should return nomeFantasia for PJ when available', () => {
      const cliente = {
        tipo: 'PJ' as TipoCliente,
        nomeCompleto: null,
        nomeFantasia: 'Empresa ABC',
        razaoSocial: 'Empresa ABC Ltda'
      } as Cliente

      expect(getClienteDisplayName(cliente)).toBe('Empresa ABC')
    })

    it('should return razaoSocial for PJ when nomeFantasia is null', () => {
      const cliente = {
        tipo: 'PJ' as TipoCliente,
        nomeCompleto: null,
        nomeFantasia: null,
        razaoSocial: 'Empresa ABC Ltda'
      } as Cliente

      expect(getClienteDisplayName(cliente)).toBe('Empresa ABC Ltda')
    })

    it('should return default message when no name available', () => {
      const clientePF = {
        tipo: 'PF' as TipoCliente,
        nomeCompleto: null,
        nomeFantasia: null,
        razaoSocial: null
      } as Cliente

      const clientePJ = {
        tipo: 'PJ' as TipoCliente,
        nomeCompleto: null,
        nomeFantasia: null,
        razaoSocial: null
      } as Cliente

      expect(getClienteDisplayName(clientePF)).toBe('Nome não informado')
      expect(getClienteDisplayName(clientePJ)).toBe('Razão social não informada')
    })
  })

  describe('getDocLast4', () => {
    it('should return last 4 digits', () => {
      expect(getDocLast4('12345678901')).toBe('8901')
    })

    it('should handle formatted document', () => {
      expect(getDocLast4('123.456.789-01')).toBe('8901')
    })

    it('should handle short document', () => {
      expect(getDocLast4('123')).toBe('123')
    })
  })

  describe('hashDocumento', () => {
    it('should create consistent hash', () => {
      const doc1 = hashDocumento('12345678901')
      const doc2 = hashDocumento('12345678901')
      expect(doc1).toBe(doc2)
    })

    it('should create different hashes for different docs', () => {
      const doc1 = hashDocumento('12345678901')
      const doc2 = hashDocumento('12345678902')
      expect(doc1).not.toBe(doc2)
    })

    it('should ignore formatting', () => {
      const doc1 = hashDocumento('12345678901')
      const doc2 = hashDocumento('123.456.789-01')
      expect(doc1).toBe(doc2)
    })
  })

  describe('sanitizeClienteInput', () => {
    it('should trim and clean input data', () => {
      const input = {
        nomeCompleto: '  João Silva  ',
        email: '  JOAO@EMAIL.COM  ',
        telefone: '(11) 99999-9999',
        documento: '123.456.789-01',
        endereco1: '  Rua ABC  ',
        endereco2: '  Apto 123  ',
        zipcode: '01234-567',
        observacoes: '  Observação  '
      }

      const result = sanitizeClienteInput(input)

      expect(result.nomeCompleto).toBe('João Silva')
      expect(result.email).toBe('joao@email.com')
      expect(result.telefone).toBe('11999999999')
      expect(result.documento).toBe('12345678901')
      expect(result.endereco1).toBe('Rua ABC')
      expect(result.endereco2).toBe('Apto 123')
      expect(result.zipcode).toBe('01234567')
      expect(result.observacoes).toBe('Observação')
    })

    it('should handle null values', () => {
      const input = {
        nomeCompleto: null,
        razaoSocial: '',
        nomeFantasia: '   ',
        endereco2: '',
        observacoes: null
      }

      const result = sanitizeClienteInput(input)

      expect(result.nomeCompleto).toBeNull()
      expect(result.razaoSocial).toBeNull()
      expect(result.nomeFantasia).toBeNull()
      expect(result.endereco2).toBeNull()
      expect(result.observacoes).toBeNull()
    })
  })

  describe('calculateClienteDiff', () => {
    it('should detect changes in fields', () => {
      const oldData = {
        nomeCompleto: 'João Silva',
        email: 'joao@old.com',
        telefone: '11999999999',
        docHash: 'hash123'
      }

      const newData = {
        nomeCompleto: 'João Santos',
        email: 'joao@new.com',
        telefone: '11999999999',
        docHash: 'hash456'
      }

      const diff = calculateClienteDiff(oldData, newData)

      expect(diff.nomeCompleto).toEqual({ old: 'João Silva', new: 'João Santos' })
      expect(diff.email).toEqual({ old: 'joao@old.com', new: 'joao@new.com' })
      expect(diff.telefone).toBeUndefined()
      expect(diff.documento).toEqual({ old: '[DOCUMENTO]', new: '[DOCUMENTO ALTERADO]' })
    })

    it('should return empty diff when no changes', () => {
      const data = {
        nomeCompleto: 'João Silva',
        email: 'joao@email.com',
        docHash: 'hash123'
      }

      const diff = calculateClienteDiff(data, data)
      expect(Object.keys(diff)).toHaveLength(0)
    })
  })
})
