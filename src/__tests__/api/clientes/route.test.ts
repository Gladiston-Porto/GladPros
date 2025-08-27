/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/clientes/route'

// Mock Prisma
jest.mock('@/server/db', () => ({
  prisma: {
    cliente: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    $executeRaw: jest.fn(),
  }
}))

// Mock auth middleware
jest.mock('@/lib/requireServerUser', () => ({
  requireServerUser: jest.fn().mockResolvedValue({
    id: '1',
    role: 'ADMIN',
    email: 'admin@test.com',
    name: 'Admin User'
  })
}))

// Mock RBAC
jest.mock('@/lib/rbac', () => ({
  can: jest.fn().mockReturnValue(true)
}))

// Mock crypto
jest.mock('@/lib/crypto', () => ({
  encryptDocument: jest.fn().mockReturnValue({
    encrypted: 'encrypted-doc',
    last4: '1234',
    hash: 'doc-hash'
  })
}))

// Mock cliente helpers
jest.mock('@/lib/helpers/cliente', () => ({
  sanitizeClienteInput: jest.fn((data) => data),
  encryptClienteData: jest.fn().mockResolvedValue({
    documentoEnc: 'encrypted-doc',
    docLast4: '1234',
    docHash: 'doc-hash'
  }),
  checkDocumentoExists: jest.fn().mockResolvedValue(false),
  checkEmailExists: jest.fn().mockResolvedValue(false),
  logClienteAudit: jest.fn().mockResolvedValue(undefined),
  getClienteDisplayName: jest.fn((cliente) => cliente.nomeCompleto || cliente.razaoSocial || 'Cliente'),
  maskDocumento: jest.fn((doc, tipo) => `***${doc}`),
  formatTelefone: jest.fn((tel) => tel),
  formatZipcode: jest.fn((zip) => zip)
}))

// Import the mocked prisma for use in tests
import { prisma } from '@/server/db'
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/clientes - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return paginated list of clientes', async () => {
    const mockClientes = [
      {
        id: 1,
        tipo: 'PF',
        nomeCompleto: 'João Silva',
        razaoSocial: null,
        email: 'joao@email.com',
        telefone: '11999999999',
        cidade: 'São Paulo',
        estado: 'SP',
        zipcode: '01310-100',
        documentoEnc: 'encrypted-doc',
        docLast4: '8901',
        ativo: true,
        criadoEm: new Date('2024-01-15'),
        atualizadoEm: new Date('2024-01-15'),
      }
    ]

    mockPrisma.cliente.findMany.mockResolvedValue(mockClientes)
    mockPrisma.cliente.count.mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/clientes?page=1&pageSize=10')
    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData).toHaveProperty('data')
    expect(responseData).toHaveProperty('total', 1)
    expect(responseData).toHaveProperty('page', 1)
    expect(responseData).toHaveProperty('pageSize', 10)
    expect(responseData.data).toHaveLength(1)
    expect(responseData.data[0]).toHaveProperty('nomeCompletoOuRazao', 'João Silva')
  })

  it('should handle search query parameter', async () => {
    mockPrisma.cliente.findMany.mockResolvedValue([])
    mockPrisma.cliente.count.mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/clientes?q=João')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { ativo: true },
          {
            OR: [
              { nomeCompleto: { contains: 'João', mode: 'insensitive' } },
              { razaoSocial: { contains: 'João', mode: 'insensitive' } },
              { email: { contains: 'João', mode: 'insensitive' } },
            ]
          }
        ]
      },
      select: expect.any(Object),
      skip: 0,
      take: 10,
      orderBy: { criadoEm: 'desc' }
    })
  })

  it('should filter by tipo', async () => {
    mockPrisma.cliente.findMany.mockResolvedValue([])
    mockPrisma.cliente.count.mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/clientes?tipo=PF')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { tipo: 'PF' }
          ])
        })
      })
    )
  })

  it('should filter by ativo status', async () => {
    mockPrisma.cliente.findMany.mockResolvedValue([])
    mockPrisma.cliente.count.mockResolvedValue(0)

    const request = new NextRequest('http://localhost/api/clientes?ativo=false')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { ativo: false }
          ])
        })
      })
    )
  })

  it('should handle database error', async () => {
    mockPrisma.cliente.findMany.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/clientes')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const responseData = await response.json()
    expect(responseData).toHaveProperty('error', 'Erro interno do servidor')
  })
})

describe('/api/clientes - POST', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new cliente', async () => {
    const newCliente = {
      id: 1,
      tipo: 'PF',
      nomeCompleto: 'João Silva',
      razaoSocial: null,
      email: 'joao@email.com',
      telefone: '11999999999',
      endereco1: 'Rua A, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      zipcode: '01310-100',
      documentoEnc: 'encrypted-doc',
      docLast4: '8901',
      docHash: 'doc-hash',
      nomeChave: 'João Silva',
      ativo: true,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    }

    mockPrisma.cliente.create.mockResolvedValue(newCliente)

    const clienteData = {
      tipo: 'PF',
      nomeCompleto: 'João Silva',
      email: 'joao@email.com',
      telefone: '11999999999',
      endereco1: 'Rua A, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      zipcode: '01310-100',
      documento: '12345678901'
    }

    const request = new NextRequest('http://localhost/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData)
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(201)
    expect(responseData).toHaveProperty('id', 1)
    expect(responseData).toHaveProperty('nomeCompletoOuRazao', 'João Silva')
    expect(mockPrisma.cliente.create).toHaveBeenCalled()
  })

  it('should validate required fields', async () => {
    const invalidData = {
      tipo: 'PF',
      // missing required fields
    }

    const request = new NextRequest('http://localhost/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const responseData = await response.json()
    expect(responseData).toHaveProperty('error')
  })

  it('should handle duplicate email error', async () => {
    mockPrisma.cliente.create.mockRejectedValue({
      code: 'P2002',
      meta: { target: ['email'] }
    })

    const clienteData = {
      tipo: 'PF',
      nomeCompleto: 'João Silva',
      email: 'duplicate@email.com',
      telefone: '11999999999',
      endereco1: 'Rua A, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      zipcode: '01310-100',
      documento: '12345678901'
    }

    const request = new NextRequest('http://localhost/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData)
    })

    const response = await POST(request)

    expect(response.status).toBe(409)
    const responseData = await response.json()
    expect(responseData).toHaveProperty('error', 'E-mail já está em uso')
  })
})
