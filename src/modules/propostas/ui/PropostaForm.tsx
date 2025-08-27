'use client'

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { StatusProposta, StatusPermite } from '@/types/prisma-temp'
import { useToast } from '@/components/ui/Toaster'
import { useClientes } from './ClientesContext'
import { 
  gp, 
  Label, 
  Input, 
  Textarea, 
  Select, 
  Section, 
  Badge, 
  currency 
} from './ui-components'
import { 
  Material, 
  Etapa, 
  PropostaFormData,
  ClienteInfo,
  PrazosInfo,
  ComerciaisInfo,
  InternoInfo,
  FaturamentoInfo
} from './types'
import { useCalcularTotais } from './hooks'
import { useAutoSave } from './useAutoSave'
import { propostaFormSchema } from './validation'

// Interface para clientes da API (not used directly in this component)

export default function PropostaFormNova() {
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [status, setStatus] = useState<StatusProposta>(StatusProposta.RASCUNHO)
  const router = useRouter()
  const { showToast } = useToast()
  
  // Usar o contexto de clientes
  const { clientes, loading: clientesLoading, error: clientesError } = useClientes()

  // Estados do formulário
  const [cliente, setCliente] = useState<ClienteInfo>({
    id: "",
    contato_nome: "",
    contato_email: "",
    contato_telefone: "",
    local_endereco: "",
    titulo: "",
  })

  const [escopo, setEscopo] = useState("")

  const [prazos, setPrazos] = useState<PrazosInfo>({
    tempo_para_aceite: 7,
    validade_proposta: "",
    prazo_execucao_dias: 5,
    janela: "",
    restricoes: "",
  })

  const [permite, setPermite] = useState<StatusPermite>(StatusPermite.NAO_NECESSARIO)
  const [quaisPermites, setQuaisPermites] = useState("")
  const [normas, setNormas] = useState("")
  const [inspecoes, setInspecoes] = useState("")

  const [comerciais, setComerciais] = useState<ComerciaisInfo>({
    condicoes_pagamento: "40% na aprovação, 40% após etapa X, 20% na entrega",
    garantia: "12 meses mão de obra; 3 meses materiais",
    exclusoes: "Demolições estruturais, pintura externa, taxas municipais",
    condicoes_gerais: "Serviços conforme normas; atrasos por clima não imputáveis; SLA 48h.",
    desconto: 0,
  })

  const [interno, setInterno] = useState<InternoInfo>({
    custo_material: 0,
    custo_mo: 0,
    horas_mo: 0,
    custo_terceiros: 0,
    overhead_pct: 12,
    margem_pct: 20,
    impostos_pct: 0,
    contingencia_pct: 0,
    frete: 0,
  })

  const [materiais, setMateriais] = useState<Material[]>([
    { 
      id: crypto.randomUUID(), 
      codigo: "CABO-14AWG", 
      nome: "Cabo 14 AWG", 
      quantidade: 120, 
      unidade: "m", 
      preco: 0.35, 
      status: "necessario" 
    },
  ])

  const [etapas, setEtapas] = useState<Etapa[]>([
    { 
      id: crypto.randomUUID(), 
      servico: "Instalação de QDC", 
      descricao: "Montagem e organização de circuitos.", 
      quantidade: 1, 
      unidade: "serviço", 
      duracaoHoras: 8, 
      custoMO: 250, 
      status: "planejada" 
    },
  ])

  const [faturamento, setFaturamento] = useState<FaturamentoInfo>({
    gatilho: "na_aprovacao",
    percentual_sinal: 40,
    forma_preferida: "Invoice",
    instrucoes: "Pagamento via invoice até 3 dias após emissão.",
  })

  const [obsCliente, setObsCliente] = useState("")
  const [obsInternas, setObsInternas] = useState("")

  // Exibir erro de clientes se houver
  useEffect(() => {
    if (clientesError) {
      showToast({
        title: 'Erro',
        message: 'Erro ao carregar lista de clientes',
        type: 'error'
      })
    }
  }, [clientesError, showToast])

  // Cálculos automáticos
  const totais = useCalcularTotais(materiais, interno)

  // Auto-save automático
  const formData: PropostaFormData = useMemo(() => ({
    cliente,
    escopo,
    prazos,
    permite,
    quaisPermites,
    normas,
    inspecoes,
    materiais,
    etapas,
    comerciais,
    interno,
    faturamento,
    obsCliente,
    obsInternas,
    status
  }), [cliente, escopo, prazos, permite, quaisPermites, normas, inspecoes, materiais, etapas, comerciais, interno, faturamento, obsCliente, obsInternas, status])

  const { debouncedSave } = useAutoSave(formData, !loading)

  // Trigger auto-save quando dados mudam (com debounce interno)
    useEffect(() => {
      // Só salvar se tiver dados mínimos; `debouncedSave` retornado pelo hook é estável
      if (cliente.id && escopo.length > 5) {
        debouncedSave(formData)
      }
  }, [formData, debouncedSave, cliente, escopo]) // Removendo debouncedSave das dependências para evitar re-execuções desnecessárias

  // Handlers utilitários
  const addMaterial = () =>
    setMateriais((arr) => [
      ...arr,
      { id: crypto.randomUUID(), codigo: "", nome: "", quantidade: 1, unidade: "un", status: "necessario" },
    ])
  const rmMaterial = (id: string) => setMateriais((arr) => arr.filter((m) => m.id !== id))

  const addEtapa = () =>
    setEtapas((arr) => [
      ...arr,
      { id: crypto.randomUUID(), servico: "", descricao: "", quantidade: 1, unidade: "serviço", status: "planejada" },
    ])
  const rmEtapa = (id: string) => setEtapas((arr) => arr.filter((e) => e.id !== id))

  // Handler para mudança de cliente
  const handleClienteChange = (clienteId: string) => {
    const clienteSelecionado = clientes.find(c => c.id === clienteId)
    if (clienteSelecionado) {
      setCliente(prev => ({
        ...prev,
        id: clienteId,
        contato_nome: clienteSelecionado.nomeCompleto || clienteSelecionado.razaoSocial || clienteSelecionado.nomeFantasia || '',
        contato_email: clienteSelecionado.email,
        contato_telefone: clienteSelecionado.telefone || '',
      }))
    }
  }

  // Salvar proposta
  const handleSalvar = async (isDraft = false) => {
    setSaveStatus('saving')
    setLoading(true)
    try {
      // Validar dados
      const validatedData = propostaFormSchema.parse(formData)

      const response = await fetch('/api/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      if (response.ok) {
        const result = await response.json()
        setSaveStatus('saved')
        showToast({
          title: 'Sucesso',
          message: isDraft ? 'Rascunho salvo com sucesso!' : 'Proposta criada com sucesso!',
          type: 'success'
        })
        
        if (!isDraft && result.proposta?.id) {
          router.push(`/propostas/${result.proposta.id}`)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao salvar proposta')
      }
    } catch (error) {
      setSaveStatus('error')
      console.error('Erro ao salvar:', error)
      showToast({
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Erro ao salvar proposta',
        type: 'error'
      })
    } finally {
      setLoading(false)
      // Reset status após 3 segundos
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // Root styles vars for brand colors
  const rootStyle: React.CSSProperties = {
  // @ts-expect-error CSS custom props
    "--gp-blue": gp.blue,
    "--gp-orange": gp.orange,
  }

  const statusBadgeColor = status === StatusProposta.PENDENTE_APROVACAO ? "orange" : status === StatusProposta.APROVADA ? "green" : "red"
  const statusLabel = status === StatusProposta.RASCUNHO ? "Rascunho" : 
                     status === StatusProposta.PENDENTE_APROVACAO ? "Aguardando" : 
                     status === StatusProposta.APROVADA ? "Aprovada" : "Cancelada"

  return (
    <div style={rootStyle} className="min-h-screen bg-slate-50 dark:bg-transparent">
      {/* Page header: title on its own line; actions right-aligned on the line below */}
      <div className="mx-auto max-w-8xl px-6 py-4">
        <div>
          <h2 className="font-title text-xl">Proposta</h2>
          <p className="mt-1 text-sm text-slate-500">Preencha os campos para gerar uma proposta completa e profissional.</p>
        </div>
        <div className="mt-3 flex justify-end items-center gap-3">
          {status === StatusProposta.RASCUNHO && (
            <div className="hidden sm:flex items-center rounded-lg bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30">Rascunho</div>
          )}
          {saveStatus === 'saving' && <span className="text-xs text-slate-500">Salvando…</span>}
          {saveStatus === 'saved' && <span className="text-xs text-emerald-600">✓ Salvo</span>}
          {saveStatus === 'error' && <span className="text-xs text-red-600">✗ Erro</span>}
          <button
            onClick={() => handleSalvar(true)}
            disabled={loading || clientesLoading}
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-white shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar rascunho'}
          </button>
          <button
            onClick={() => handleSalvar(false)}
            disabled={loading || clientesLoading}
            className="rounded-xl bg-[var(--gp-blue)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Proposta'}
          </button>
        </div>
      </div>

      <main className="mx-auto grid max-w-8xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-4">
        {/* Left column (form) */}
  <div className="order-2 flex flex-col gap-6 lg:order-1 lg:col-span-3">
          <Section title="Dados Cadastrais" subtitle="Dados do cliente e do local de execução.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label required>Cliente</Label>
                {clientesLoading ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border border-slate-400 border-t-transparent"></div>
                    <span className="text-sm text-slate-500">Carregando clientes...</span>
                  </div>
                ) : (
                  <Select 
                    value={cliente.id} 
                    onChange={(e) => handleClienteChange(e.target.value)}
                    disabled={clientesLoading}
                  >
                    <option value="">Selecionar cliente…</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nomeCompleto || c.razaoSocial || c.nomeFantasia} - {c.email}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div>
                <Label required>Título</Label>
                <Input 
                  placeholder="Reforma elétrica apto 12B" 
                  value={cliente.titulo} 
                  onChange={(e) => setCliente({ ...cliente, titulo: e.target.value })} 
                />
              </div>
              <div>
                <Label required>Contato – Nome</Label>
                <Input 
                  value={cliente.contato_nome} 
                  onChange={(e) => setCliente({ ...cliente, contato_nome: e.target.value })} 
                />
              </div>
              <div>
                <Label required>Contato – E‑mail</Label>
                <Input 
                  type="email" 
                  value={cliente.contato_email} 
                  onChange={(e) => setCliente({ ...cliente, contato_email: e.target.value })} 
                />
              </div>
              <div>
                <Label>Contato – Telefone</Label>
                <Input 
                  value={cliente.contato_telefone} 
                  onChange={(e) => setCliente({ ...cliente, contato_telefone: e.target.value })} 
                />
              </div>
              <div className="md:col-span-2">
                <Label required>Endereço de execução</Label>
                <Input 
                  placeholder="Rua, nº, cidade, estado, CEP" 
                  value={cliente.local_endereco} 
                  onChange={(e) => setCliente({ ...cliente, local_endereco: e.target.value })} 
                />
              </div>
              <div className="md:col-span-2">
                <Label required>Escopo (resumo)</Label>
                <Textarea 
                  placeholder="Descreva o escopo geral do serviço…" 
                  value={escopo}
                  onChange={(e) => setEscopo(e.target.value)}
                />
              </div>
            </div>
          </Section>

          <Section title="Prazos" subtitle="Defina validade da proposta e prazos de execução.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label required>Tempo para aceite (dias)</Label>
                <Input 
                  type="number" 
                  value={prazos.tempo_para_aceite} 
                  onChange={(e) => setPrazos({ ...prazos, tempo_para_aceite: Number(e.target.value) })} 
                />
              </div>
              <div>
                <Label required>Validade da proposta</Label>
                <Input 
                  type="date" 
                  value={prazos.validade_proposta} 
                  onChange={(e) => setPrazos({ ...prazos, validade_proposta: e.target.value })} 
                />
              </div>
              <div>
                <Label required>Prazo de execução (dias)</Label>
                <Input 
                  type="number" 
                  value={prazos.prazo_execucao_dias} 
                  onChange={(e) => setPrazos({ ...prazos, prazo_execucao_dias: Number(e.target.value) })} 
                />
              </div>
              <div>
                <Label>Janela preferencial</Label>
                <Input 
                  placeholder="Seg‑Sex, 8h–17h" 
                  value={prazos.janela} 
                  onChange={(e) => setPrazos({ ...prazos, janela: e.target.value })} 
                />
              </div>
              <div className="md:col-span-4">
                <Label>Restrições de acesso</Label>
                <Textarea 
                  placeholder="Ex.: cadastro de visitantes, carga/descarga até 16h…" 
                  value={prazos.restricoes} 
                  onChange={(e) => setPrazos({ ...prazos, restricoes: e.target.value })} 
                />
              </div>
            </div>
          </Section>

          <Section title="Permissões / Conformidades" subtitle="Permits, normas e inspeções.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label required>Permits necessários?</Label>
                <Select value={permite} onChange={(e) => setPermite(e.target.value as StatusPermite)}>
                  <option value={StatusPermite.NAO_NECESSARIO}>Não</option>
                  <option value={StatusPermite.NECESSARIO}>Sim</option>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Label className={permite === StatusPermite.NECESSARIO ? "" : "opacity-50"}>Quais permits</Label>
                <Input 
                  disabled={permite !== StatusPermite.NECESSARIO} 
                  placeholder="Ex.: Elétrica (City of Dallas)" 
                  value={quaisPermites} 
                  onChange={(e) => setQuaisPermites(e.target.value)} 
                />
              </div>
              <div className="md:col-span-2">
                <Label>Normas de referência</Label>
                <Input 
                  placeholder="NEC 2023, ABNT NBR 5410" 
                  value={normas} 
                  onChange={(e) => setNormas(e.target.value)} 
                />
              </div>
              <div className="md:col-span-2">
                <Label>Inspeções necessárias</Label>
                <Input 
                  placeholder="Inspeção final elétrica" 
                  value={inspecoes} 
                  onChange={(e) => setInspecoes(e.target.value)} 
                />
              </div>
            </div>
          </Section>

          <Section title="Materiais" subtitle="Liste os materiais com quantidades e unidades.">
            <div className="flex flex-col gap-3">
              {materiais.map((m) => (
                <div key={m.id} className="grid grid-cols-12 items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:bg-transparent dark:border-white/10 p-3">
                  <div className="col-span-2">
                    <Label required>Código</Label>
                    <Input value={m.codigo} onChange={(e) => setMateriais((arr) => arr.map((x) => (x.id === m.id ? { ...x, codigo: e.target.value } : x)))} />
                  </div>
                  <div className="col-span-3">
                    <Label required>Nome</Label>
                    <Input value={m.nome} onChange={(e) => setMateriais((arr) => arr.map((x) => (x.id === m.id ? { ...x, nome: e.target.value } : x)))} />
                  </div>
                  <div className="col-span-2">
                    <Label required>Quantidade</Label>
                    <Input type="number" value={m.quantidade} onChange={(e) => setMateriais((arr) => arr.map((x) => (x.id === m.id ? { ...x, quantidade: Number(e.target.value) } : x)))} />
                  </div>
                  <div className="col-span-1">
                    <Label required>Un</Label>
                    <Input value={m.unidade} onChange={(e) => setMateriais((arr) => arr.map((x) => (x.id === m.id ? { ...x, unidade: e.target.value } : x)))} />
                  </div>
                  <div className="col-span-2">
                    <Label>Preço unit. (interno)</Label>
                    <Input type="number" step="0.01" value={m.preco ?? ""} onChange={(e) => setMateriais((arr) => arr.map((x) => (x.id === m.id ? { ...x, preco: Number(e.target.value) } : x)))} />
                  </div>
                  <div className="col-span-2 flex items-end justify-end gap-2">
                    <button onClick={() => rmMaterial(m.id)} className="rounded-lg border border-rose-200 bg-white dark:bg-white/5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50">Remover</button>
                  </div>
                </div>
              ))}
              <div>
                <button onClick={addMaterial} className="rounded-xl bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-[var(--gp-blue)] shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-white/5 hover:bg-slate-50">
                  + Adicionar material
                </button>
              </div>
            </div>
          </Section>

          <Section title="Etapas / Serviços" subtitle="Descreva o que será executado e critérios de aceite.">
            <div className="flex flex-col gap-3">
              {etapas.map((e) => (
                <div key={e.id} className="grid grid-cols-12 gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:bg-transparent dark:border-white/10 p-3">
                  <div className="col-span-3">
                    <Label required>Serviço</Label>
                    <Input value={e.servico} onChange={(ev) => setEtapas((arr) => arr.map((x) => (x.id === e.id ? { ...x, servico: ev.target.value } : x)))} />
                  </div>
                  <div className="col-span-5">
                    <Label required>Descrição</Label>
                    <Textarea rows={3} value={e.descricao} onChange={(ev) => setEtapas((arr) => arr.map((x) => (x.id === e.id ? { ...x, descricao: ev.target.value } : x)))} />
                  </div>
                  <div className="col-span-1">
                    <Label>Qtd</Label>
                    <Input type="number" value={e.quantidade ?? ""} onChange={(ev) => setEtapas((arr) => arr.map((x) => (x.id === e.id ? { ...x, quantidade: Number(ev.target.value) } : x)))} />
                  </div>
                  <div className="col-span-1">
                    <Label>Un</Label>
                    <Input value={e.unidade ?? ""} onChange={(ev) => setEtapas((arr) => arr.map((x) => (x.id === e.id ? { ...x, unidade: ev.target.value } : x)))} />
                  </div>
                  <div className="col-span-1">
                    <Label>Horas</Label>
                    <Input type="number" value={e.duracaoHoras ?? ""} onChange={(ev) => setEtapas((arr) => arr.map((x) => (x.id === e.id ? { ...x, duracaoHoras: Number(ev.target.value) } : x)))} />
                  </div>
                  <div className="col-span-1">
                    <Label>Custo MO</Label>
                    <Input type="number" step="0.01" value={e.custoMO ?? ""} onChange={(ev) => setEtapas((arr) => arr.map((x) => (x.id === e.id ? { ...x, custoMO: Number(ev.target.value) } : x)))} />
                  </div>
                  <div className="col-span-12 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Status</Label>
                      <Select value={e.status} onChange={(ev) => setEtapas((arr) => arr.map((x) => (x.id === e.id ? { ...x, status: ev.target.value as 'planejada' | 'opcional' | 'removida' } : x)))} className="w-auto">
                        <option value="planejada">Planejada</option>
                        <option value="opcional">Opcional</option>
                        <option value="removida">Removida</option>
                      </Select>
                    </div>
                    <button onClick={() => rmEtapa(e.id)} className="rounded-lg border border-rose-200 bg-white dark:bg-white/5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50">Remover</button>
                  </div>
                </div>
              ))}
              <div>
                <button onClick={addEtapa} className="rounded-xl bg-white dark:bg-white/5 px-4 py-2 text-sm font-medium text-[var(--gp-blue)] shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-white/5 hover:bg-slate-50">
                  + Adicionar etapa
                </button>
              </div>
            </div>
          </Section>

          <Section title="Condições Comerciais" subtitle="Tudo que o cliente precisa saber para decidir.">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label required>Condições de pagamento</Label>
                <Textarea value={comerciais.condicoes_pagamento} onChange={(e) => setComerciais({ ...comerciais, condicoes_pagamento: e.target.value })} />
              </div>
              <div>
                <Label required>Garantia</Label>
                <Textarea value={comerciais.garantia} onChange={(e) => setComerciais({ ...comerciais, garantia: e.target.value })} />
              </div>
              <div>
                <Label required>Exclusões</Label>
                <Textarea value={comerciais.exclusoes} onChange={(e) => setComerciais({ ...comerciais, exclusoes: e.target.value })} />
              </div>
              <div>
                <Label required>Condições gerais</Label>
                <Textarea value={comerciais.condicoes_gerais} onChange={(e) => setComerciais({ ...comerciais, condicoes_gerais: e.target.value })} />
              </div>
            </div>
          </Section>

          <Section title="Faturamento / Invoice" subtitle="Defina quando e como faturar.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label required>Gatilho</Label>
                <Select value={faturamento.gatilho} onChange={(e) => setFaturamento({ ...faturamento, gatilho: e.target.value as 'na_aprovacao' | 'por_marcos' | 'na_entrega' | 'custom' })}>
                  <option value="na_aprovacao">Na aprovação</option>
                  <option value="por_marcos">Por marcos</option>
                  <option value="na_entrega">Na entrega</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div>
                <Label>% sinal (se aplicável)</Label>
                <Input type="number" value={faturamento.percentual_sinal} onChange={(e) => setFaturamento({ ...faturamento, percentual_sinal: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Forma preferida</Label>
                <Select value={faturamento.forma_preferida} onChange={(e) => setFaturamento({ ...faturamento, forma_preferida: e.target.value })}>
                  <option>Invoice</option>
                  <option>PIX/Zelle</option>
                  <option>Cartão</option>
                  <option>Transferência</option>
                </Select>
              </div>
              <div className="md:col-span-4">
                <Label>Instruções</Label>
                <Textarea value={faturamento.instrucoes} onChange={(e) => setFaturamento({ ...faturamento, instrucoes: e.target.value })} />
              </div>
            </div>
          </Section>

          <Section title="Observações">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Observações para o cliente (aparecem no PDF)</Label>
                <Textarea value={obsCliente} onChange={(e) => setObsCliente(e.target.value)} />
              </div>
              <div>
                <Label>Observações internas (não aparecem no PDF)</Label>
                <Textarea value={obsInternas} onChange={(e) => setObsInternas(e.target.value)} />
              </div>
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button 
              onClick={() => handleSalvar(false)}
              disabled={loading}
              className="rounded-xl bg-[var(--gp-blue)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar e continuar'}
            </button>
          </div>

          {/* Continue na próxima parte... */}
        </div>

        {/* Right column (sidebar summary) será adicionado na próxima parte */}
        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <section className="rounded-2xl border border-slate-200 bg-white dark:bg-white/5 dark:border-white/10 p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-base font-semibold text-slate-800">Resumo de Preço (interno)</h3>
              <Badge>Privado</Badge>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Materiais</span>
                <span className="text-right font-medium">{currency(totais.mat)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Mão de obra</span>
                <span className="text-right font-medium">{currency(totais.mo)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Terceiros</span>
                <span className="text-right font-medium">{currency(totais.terce)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Frete/Logística</span>
                <span className="text-right font-medium">{currency(totais.frete)}</span>
              </div>
              <hr className="my-2" />
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Overhead</span>
                <span className="text-right font-medium">{currency(totais.overhead)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Margem</span>
                <span className="text-right font-medium">{currency(totais.margem)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Contingência</span>
                <span className="text-right font-medium">{currency(totais.conting)}</span>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-slate-500">Impostos</span>
                <span className="text-right font-medium">{currency(totais.impostos)}</span>
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 dark:bg-transparent p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Preço ao cliente (estimado)</span>
                  <span className="text-base font-semibold text-slate-900">{currency(totais.precoCliente)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <Label>Overhead (%)</Label>
                <Input type="number" value={interno.overhead_pct} onChange={(e) => setInterno({ ...interno, overhead_pct: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Margem (%)</Label>
                <Input type="number" value={interno.margem_pct} onChange={(e) => setInterno({ ...interno, margem_pct: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Impostos (%)</Label>
                <Input type="number" value={interno.impostos_pct} onChange={(e) => setInterno({ ...interno, impostos_pct: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Contingência (%)</Label>
                <Input type="number" value={interno.contingencia_pct} onChange={(e) => setInterno({ ...interno, contingencia_pct: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Custo materiais</Label>
                <Input type="number" step="0.01" value={interno.custo_material} onChange={(e) => setInterno({ ...interno, custo_material: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Custo mão de obra</Label>
                <Input type="number" step="0.01" value={interno.custo_mo} onChange={(e) => setInterno({ ...interno, custo_mo: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Horas MO</Label>
                <Input type="number" value={interno.horas_mo} onChange={(e) => setInterno({ ...interno, horas_mo: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Terceiros</Label>
                <Input type="number" step="0.01" value={interno.custo_terceiros} onChange={(e) => setInterno({ ...interno, custo_terceiros: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Frete/Log</Label>
                <Input type="number" step="0.01" value={interno.frete} onChange={(e) => setInterno({ ...interno, frete: Number(e.target.value) })} />
              </div>
            </div>
          </section>

          <Section title="Status da Proposta" subtitle="Controle o estado atual da proposta.">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  Status atual: <Badge color={statusBadgeColor}>{statusLabel}</Badge>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStatus(StatusProposta.APROVADA)} className="rounded-xl border border-emerald-200 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Marcar aprovada</button>
                  <button onClick={() => setStatus(StatusProposta.CANCELADA)} className="rounded-xl border border-rose-200 bg-white dark:bg-white/5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Cancelar</button>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-4 text-center text-xs text-slate-400">
        Formulário de proposta • GladPros • Sistema integrado
      </footer>
    </div>
  )
}
