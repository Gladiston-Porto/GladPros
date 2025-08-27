// src/app/api/propostas/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db-temp";
// trimmed unused imports for lint
import { propostaFormSchema } from "@modules/propostas/ui/validation";
import { adaptPropostaFormToAPI } from "@modules/propostas/ui/adapter";
import type { PropostaFormData } from '@modules/propostas/ui/types';
import { requireServerUser } from "@/lib/requireServerUser";

// Retry helper para transações DB
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 300): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
  // Normalize unknown error into a safe shape without using `any` casts
  const maybeObj = typeof err === 'object' && err !== null ? err as Record<string, unknown> : {};
  const getStr = (key: string) => (typeof maybeObj[key] === 'string' ? (maybeObj[key] as string) : undefined);
  const code = getStr('code') ?? getStr('errorCode');
  const name = getStr('name');
      const isInit = name === "PrismaClientInitializationError" || code === "P1001";
      if (!isInit || i === retries) throw err;
      lastErr = err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// Helper para mapear erros do Prisma
function mapPrismaError(error: unknown): { status: number; message: string; fields?: Record<string, string> } {
  const e = error as { code?: string; meta?: { target?: Array<string> } | null };

  if (e.code === 'P2002') {
    const target = Array.isArray(e.meta?.target) ? e.meta?.target[0] : undefined;
    if (target === 'numeroProposta') {
      return { status: 409, message: 'Número da proposta já existe' };
    }
    return { status: 409, message: 'Violação de restrição única' };
  }

  if (e.code === 'P2025') {
    return { status: 404, message: 'Registro não encontrado' };
  }

  return { status: 500, message: 'Erro interno do servidor' };
}

// GET /api/propostas - Lista com filtros e paginação por cursor
export async function GET(/* request: NextRequest */) {
  try {
    console.log('GET /api/propostas - iniciado');
    
    // TEMPORARY STUB - retorna dados mock para testar
    return NextResponse.json({
      items: [],
      pagination: {
        total: 0,
        hasNext: false,
        nextCursor: null,
        pageSize: 10
      }
    });

  } catch (error) {
    console.error('GET /api/propostas error:', error);
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// POST /api/propostas - Criar nova proposta
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/propostas - iniciado');

    // Verificar autenticação
    const user = await requireServerUser();
    if (!user) {
      return NextResponse.json({
        error: 'UNAUTHORIZED',
        message: 'Usuário não autenticado'
      }, { status: 401 });
    }

    // Parse do body
    const body = await request.json();
    console.log('Body recebido:', JSON.stringify(body, null, 2));

    // Validar dados com schema do novo formulário
    const validatedData = propostaFormSchema.parse(body);
    
  // Converter para formato da API/DB
  // validatedData is a Zod-validated object; cast via unknown to the adapter input type
  const apiPayload = adaptPropostaFormToAPI(validatedData as unknown as PropostaFormData);
    
    // Criar proposta usando o temporary DB client
    const novaProposta = await withRetry(async () => {
      // Gerar número da proposta
      const numeroProposta = await db.generatePropostaNumber();
      
      console.log('Criando proposta com número:', numeroProposta);
      console.log('Dados adaptados:', JSON.stringify(apiPayload, null, 2));
      
      // Simular criação (como estamos usando db temporário)
      const proposta = {
        id: Math.floor(Math.random() * 10000) + 1000,
        numeroProposta,
        titulo: apiPayload.titulo,
        descricao: apiPayload.descricao,
        status: apiPayload.status,
        valorEstimado: apiPayload.valorEstimado,
        clienteId: apiPayload.clienteId,
        usuarioId: user.id,
        contatoNome: apiPayload.contatoNome,
        contatoEmail: apiPayload.contatoEmail,
        contatoTelefone: apiPayload.contatoTelefone,
        localExecucaoEndereco: apiPayload.localExecucaoEndereco,
        tempoParaAceite: apiPayload.tempoParaAceite,
        validadeProposta: apiPayload.validadeProposta,
        prazoExecucaoDias: apiPayload.prazoExecucaoDias,
        janelaExecucao: apiPayload.janelaExecucao,
        restricoesAcesso: apiPayload.restricoesAcesso,
        permite: apiPayload.permite,
        quaisPermites: apiPayload.quaisPermites,
        normasReferencia: apiPayload.normasReferencia,
        inspecoesNecessarias: apiPayload.inspecoesNecessarias,
        condicoesPagamento: apiPayload.condicoesPagamento,
        garantia: apiPayload.garantia,
        exclusoes: apiPayload.exclusoes,
        condicoesGerais: apiPayload.condicoesGerais,
        observacoesCliente: apiPayload.observacoesCliente,
        observacoesInternas: apiPayload.observacoesInternas,
        estimativasInternas: apiPayload.estimativasInternas,
        materiais: apiPayload.materiais,
        etapas: apiPayload.etapas,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      };

      console.log('Proposta criada (simulada):', proposta.id);
      return proposta;
    });

    // Retornar resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Proposta criada com sucesso',
      proposta: {
        id: novaProposta.id,
        numeroProposta: novaProposta.numeroProposta,
        titulo: novaProposta.titulo,
        status: novaProposta.status,
        valorEstimado: novaProposta.valorEstimado,
        criadoEm: novaProposta.criadoEm
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/propostas error:', error);

    // Tratamento de erros de validação
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 });
    }

    // Tratamento de outros erros
    const mappedError = mapPrismaError(error);
    return NextResponse.json({
      error: 'DATABASE_ERROR',
      message: mappedError.message
    }, { status: mappedError.status });
  }
}
