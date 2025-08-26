import {
  maskDocumento,
  formatTelefone,
  formatZipcode,
  getDocLast4,
  hashDocumento
} from '@/lib/helpers/cliente'
import { TipoCliente } from '@prisma/client'

describe('Cliente Helpers - Basic Functions', () => {
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
  })

  describe('formatTelefone', () => {
    it('should format 11-digit phone number', () => {
      expect(formatTelefone('11999999999')).toBe('(11) 99999-9999')
    })

    it('should format 10-digit phone number', () => {
      expect(formatTelefone('1133334444')).toBe('(11) 3333-4444')
    })
  })

  describe('formatZipcode', () => {
    it('should format valid zipcode', () => {
      expect(formatZipcode('01234567')).toBe('01234-567')
    })
  })

  describe('getDocLast4', () => {
    it('should return last 4 digits', () => {
      expect(getDocLast4('12345678901')).toBe('8901')
    })
  })

  describe('hashDocumento', () => {
    it('should create consistent hash', () => {
      const doc1 = hashDocumento('12345678901')
      const doc2 = hashDocumento('12345678901')
      expect(doc1).toBe(doc2)
    })
  })
})
