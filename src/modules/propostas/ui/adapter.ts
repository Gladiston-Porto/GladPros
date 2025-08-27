// Adapter para converter dados do novo formulário para o formato da API/DB atual
import { PropostaFormData } from '@modules/propostas/ui/types'
import { StatusProposta, StatusPermite } from '@/types/prisma-temp'

export interface PropostaAPIPayload {
  // Dados principais
  clienteId: number
  titulo?: string
  descricao?: string
  valorEstimado: number
  status: StatusProposta
  
  // Contato e local
  contatoNome: string
  contatoEmail: string
  contatoTelefone?: string
  localExecucaoEndereco: string
  
  // Prazos
  tempoParaAceite: number
  validadeProposta: Date
  prazoExecucaoDias: number
  janelaExecucao?: string
  restricoesAcesso?: string
  
  // Permits e conformidade
  permite: StatusPermite
  quaisPermites?: string
  normasReferencia?: string
  inspecoesNecessarias?: string
  
  // Comerciais
  condicoesPagamento: string
  garantia: string
  exclusoes: string
  condicoesGerais: string
  
  // Estimativas internas
  estimativasInternas: {
    custoMaterialEstimado: number
    custoMaoObraEstimado: number
    horasMaoObraEstimadas: number
    custoTerceirosEstimado: number
    overheadPercentual: number
    margemDesejadaPercentual: number
    impostosPercentual: number
    contingenciaPercentual: number
    freteLogisticaEstimado: number
    totalEstimadoInterno: number
  }
  
  // Faturamento
  gatilhoFaturamento: string
  percentualSinal: number
  formaPreferida: string
  instrucoesFaturamento?: string
  
  // Observações
  observacoesCliente?: string
  observacoesInternas?: string
  
  // Materiais e etapas (simplified for DB)
  materiais: Array<{
    codigo: string
    nome: string
    quantidade: number
    unidade: string
    valorUnitarioEstimado?: number
    status: string
    fornecedor?: string
    observacoes?: string
  }>
  
  etapas: Array<{
    servico: string
    descricao: string
    ordem: number
    quantidade?: number
    unidade?: string
    duracaoEstimadaHoras?: number
    custoMaoObraEstimado?: number
    status: string
  }>
}

export function adaptPropostaFormToAPI(formData: PropostaFormData): PropostaAPIPayload {
  // Calcular totais
  const custoMaterial = formData.materiais.reduce(
    (acc: number, m: { preco?: number; quantidade: number }) =>
      acc + (m.preco ?? 0) * m.quantidade,
    0
  )
  const custoMaoObra = formData.interno.custo_mo
  const custoTerceiros = formData.interno.custo_terceiros
  const freteLogistica = formData.interno.frete
  
  const base = custoMaterial + custoMaoObra + custoTerceiros + freteLogistica
  const overhead = base * (formData.interno.overhead_pct / 100)
  const margem = (base + overhead) * (formData.interno.margem_pct / 100)
  const contingencia = (base + overhead + margem) * (formData.interno.contingencia_pct / 100)
  const subtotal = base + overhead + margem + contingencia
  const impostos = subtotal * (formData.interno.impostos_pct / 100)
  const valorTotal = subtotal + impostos

  return {
    clienteId: parseInt(formData.cliente.id),
    titulo: formData.cliente.titulo,
    descricao: formData.escopo,
    valorEstimado: valorTotal,
    status: formData.status,
    
    // Contato
    contatoNome: formData.cliente.contato_nome,
    contatoEmail: formData.cliente.contato_email,
    contatoTelefone: formData.cliente.contato_telefone || undefined,
    localExecucaoEndereco: formData.cliente.local_endereco,
    
    // Prazos
    tempoParaAceite: formData.prazos.tempo_para_aceite,
    validadeProposta: new Date(formData.prazos.validade_proposta),
    prazoExecucaoDias: formData.prazos.prazo_execucao_dias,
    janelaExecucao: formData.prazos.janela,
    restricoesAcesso: formData.prazos.restricoes,
    
    // Permits
    permite: formData.permite,
    quaisPermites: formData.quaisPermites,
    normasReferencia: formData.normas,
    inspecoesNecessarias: formData.inspecoes,
    
    // Comerciais
    condicoesPagamento: formData.comerciais.condicoes_pagamento,
    garantia: formData.comerciais.garantia,
    exclusoes: formData.comerciais.exclusoes,
    condicoesGerais: formData.comerciais.condicoes_gerais,
    
    // Estimativas internas
    estimativasInternas: {
      custoMaterialEstimado: custoMaterial,
      custoMaoObraEstimado: custoMaoObra,
      horasMaoObraEstimadas: formData.interno.horas_mo,
      custoTerceirosEstimado: custoTerceiros,
      overheadPercentual: formData.interno.overhead_pct,
      margemDesejadaPercentual: formData.interno.margem_pct,
      impostosPercentual: formData.interno.impostos_pct,
      contingenciaPercentual: formData.interno.contingencia_pct,
      freteLogisticaEstimado: freteLogistica,
      totalEstimadoInterno: valorTotal
    },
    
    // Faturamento
    gatilhoFaturamento: formData.faturamento.gatilho.toUpperCase(),
    percentualSinal: formData.faturamento.percentual_sinal,
    formaPreferida: formData.faturamento.forma_preferida,
    instrucoesFaturamento: formData.faturamento.instrucoes,
    
    // Observações
    observacoesCliente: formData.obsCliente,
    observacoesInternas: formData.obsInternas,
    
    // Materiais adaptados
    materiais: formData.materiais.map((m: { id?: string; codigo?: string; nome?: string; preco?: number; quantidade: number; unidade?: string; status?: string; fornecedor?: string; obs?: string }) => ({
      codigo: String(m.codigo ?? ''),
      nome: String(m.nome ?? ''),
      quantidade: m.quantidade,
      unidade: String(m.unidade ?? ''),
      valorUnitarioEstimado: m.preco,
      status: String((m.status ?? ''))?.toUpperCase(),
      fornecedor: m.fornecedor ? String(m.fornecedor) : undefined,
      observacoes: m.obs ? String(m.obs) : undefined
    })),
    
    // Etapas adaptadas
    etapas: formData.etapas.map((e: unknown, index: number) => {
      type EtapaForm = { servico?: string; descricao?: string; quantidade?: number; unidade?: string; duracaoHoras?: number; custoMO?: number; status?: string }
      const et = e as EtapaForm
      return ({
        servico: String(et.servico ?? ''),
        descricao: String(et.descricao ?? ''),
        ordem: index + 1,
        quantidade: et.quantidade,
        unidade: et.unidade ? String(et.unidade) : undefined,
        duracaoEstimadaHoras: et.duracaoHoras,
        custoMaoObraEstimado: et.custoMO,
        status: et.status ? String(et.status).toUpperCase() : 'PLANEJADA'
      })
    })
  }
}
