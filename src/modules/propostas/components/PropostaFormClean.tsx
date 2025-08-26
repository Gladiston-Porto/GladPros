'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Save
} from 'lucide-react'
import { 
  StatusPermite
} from '@/types/propostas'
import Link from 'next/link'
import { ProposalSignaturePad } from '@/components/ui/ProposalSignaturePad'

interface Cliente {
  id: string
  nome: string
  email: string
}

interface EtapaForm {
  titulo: string
  descricao: string
  valorEstimado: number
  ordem: number
}

interface MaterialForm {
  nome: string
  descricao: string
  quantidade: number
  unidade: string
  valorUnitario: number
  fornecedor: string
  observacoes: string
}

interface PropostaFormData {
  clienteId: string
  
  // Informações de contato e execução
  contatoNome: string
  contatoEmail: string
  contatoTelefone: string
  localExecucaoEndereco: string
  
  // Título e escopo
  titulo: string
  descricaoEscopo: string
  tipoServico: string
  
  // Prazos e validade
  tempoParaAceite: number
  validadeProposta: string
  prazoExecucaoEstimadoDias: number
  janelaExecucaoPreferencial: string
  restricoesDeAcesso: string
  
  // Permissões
  permite: StatusPermite
  quaisPermites: string
  normasReferencias: string
  inspecoesNecessarias: string
  
  // Condições comerciais
  garantia: string
  exclusoes: string
  condicoesGerais: string
  descontosOfertados: number
  
  // Valores
  valorEstimado: number
  precoPropostaCliente: number
  
  // Faturamento
  gatilhoFaturamento: string
  percentualSinal: number
  instrucoesPagamento: string
  
  // Observações
  observacoesParaCliente: string
  riscosIdentificados: string
  
  etapas: EtapaForm[]
  materiais: MaterialForm[]
}

export default function PropostaForm() {
  const [loading, setLoading] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [savedPropostaId, setSavedPropostaId] = useState<string | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<PropostaFormData>({
    clienteId: '',
    
    // Informações de contato e execução
    contatoNome: '',
    contatoEmail: '',
    contatoTelefone: '',
    localExecucaoEndereco: '',
    
    // Título e escopo
    titulo: '',
    descricaoEscopo: '',
    tipoServico: '',
    
    // Prazos e validade
    tempoParaAceite: 7,
    validadeProposta: '',
    prazoExecucaoEstimadoDias: 0,
    janelaExecucaoPreferencial: '',
    restricoesDeAcesso: '',
    
    // Permissões
    permite: StatusPermite.NAO,
    quaisPermites: '',
    normasReferencias: '',
    inspecoesNecessarias: '',
    
    // Condições comerciais
    garantia: '',
    exclusoes: '',
    condicoesGerais: '',
    descontosOfertados: 0,
    
    // Valores
    valorEstimado: 0,
    precoPropostaCliente: 0,
    
    // Faturamento
    gatilhoFaturamento: 'NA_APROVACAO',
    percentualSinal: 0,
    instrucoesPagamento: '',
    
    // Observações
    observacoesParaCliente: '',
    riscosIdentificados: '',
    
    etapas: [],
    materiais: []
  })

  // Load clientes
  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const clientesList = (data.clientes || []).map((cliente: any) => ({
          id: cliente.id,
          nome: cliente.nomeCompleto || cliente.razaoSocial || cliente.nomeFantasia || 'Cliente',
          email: cliente.email
        }))
        setClientes(clientesList)
      }
    } catch (error) {
      console.error('Error loading clientes:', error)
    }
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.clienteId) {
      toast({
        title: 'Erro',
        description: 'Cliente é obrigatório',
        variant: 'destructive'
      })
      return
    }
    
    if (!formData.titulo) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive'
      })
      return
    }
    
    if (!formData.descricaoEscopo) {
      toast({
        title: 'Erro',
        description: 'Descrição do escopo é obrigatória',
        variant: 'destructive'
      })
      return
    }

    if (!formData.contatoNome) {
      toast({
        title: 'Erro',
        description: 'Nome do contato é obrigatório',
        variant: 'destructive'
      })
      return
    }

    if (!formData.contatoEmail) {
      toast({
        title: 'Erro',
        description: 'Email do contato é obrigatório',
        variant: 'destructive'
      })
      return
    }

    if (!formData.localExecucaoEndereco) {
      toast({
        title: 'Erro',
        description: 'Endereço de execução é obrigatório',
        variant: 'destructive'
      })
      return
    }
    
    if (formData.permite === StatusPermite.SIM && !formData.quaisPermites.trim()) {
      toast({
        title: 'Erro',
        description: 'Campo "Quais permites" é obrigatório quando permite = SIM',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/propostas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar proposta')
      }

      const proposta = await response.json()
      
      // Salvar ID da proposta e mostrar tela de assinatura
      setSavedPropostaId(proposta.id)
      setShowSignature(true)
      
      toast({
        title: 'Proposta Criada',
        description: `Proposta ${proposta.numeroProposta || 'criada'} - Proceda com a assinatura digital`
      })

    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle signature completion
  const handleSignatureComplete = async (signatureData: {
    type: 'canvas' | 'name'
    signatureName: string
    signatureImage?: string
    consent: boolean
    terms: boolean
    observations?: string
  }) => {
    if (!savedPropostaId) return
    
    try {
      setLoading(true)
      
      // Call signature API
      const response = await fetch(`/api/propostas/${savedPropostaId}/assinatura`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assinaturaTipo: signatureData.type === 'canvas' ? 'DIGITAL_DESENHADA' : 'DIGITAL_NOME',
          assinaturaNome: signatureData.signatureName,
          assinaturaImagem: signatureData.signatureImage,
          observacoes: signatureData.observations,
          consentimento: signatureData.consent,
          termosAceitos: signatureData.terms
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao processar assinatura')
      }

      const result = await response.json()
      
      toast({
        title: 'Assinatura Confirmada',
        description: 'Proposta assinada digitalmente com sucesso!'
      })

      // Redirect to proposta view
      router.push(`/propostas/${savedPropostaId}`)

    } catch (error) {
      toast({
        title: 'Erro na Assinatura',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Cancel signature and go back to form
  const handleSignatureCancel = () => {
    setShowSignature(false)
    setSavedPropostaId(null)
  }

  // Add etapa
  const addEtapa = () => {
    setFormData(prev => ({
      ...prev,
      etapas: [...prev.etapas, {
        titulo: '',
        descricao: '',
        valorEstimado: 0,
        ordem: prev.etapas.length
      }]
    }))
  }

  // Remove etapa
  const removeEtapa = (index: number) => {
    setFormData(prev => ({
      ...prev,
      etapas: prev.etapas.filter((_, i) => i !== index)
    }))
  }

  // Update etapa
  const updateEtapa = (index: number, field: keyof EtapaForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      etapas: prev.etapas.map((etapa, i) => 
        i === index ? { ...etapa, [field]: value } : etapa
      )
    }))
  }

  // Add material
  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materiais: [...prev.materiais, {
        nome: '',
        descricao: '',
        quantidade: 1,
        unidade: '',
        valorUnitario: 0,
        fornecedor: '',
        observacoes: ''
      }]
    }))
  }

  // Remove material
  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materiais: prev.materiais.filter((_, i) => i !== index)
    }))
  }

  // Update material
  const updateMaterial = (index: number, field: keyof MaterialForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      materiais: prev.materiais.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }))
  }

  useEffect(() => {
    loadClientes()
  }, [])

  // Show signature pad if ready
  if (showSignature && savedPropostaId) {
    return (
      <ProposalSignaturePad
        proposta={{
          numeroProposta: 'Nova Proposta',
          titulo: formData.titulo,
          precoPropostaCliente: formData.precoPropostaCliente || undefined,
          condicoesGerais: formData.condicoesGerais || undefined
        }}
        onSignatureComplete={handleSignatureComplete}
        onCancel={handleSignatureCancel}
        loading={loading}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/propostas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nova Proposta</h1>
            <p className="text-muted-foreground">Criar nova proposta comercial</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente *</label>
                <Select 
                  value={formData.clienteId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Estimado (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.valorEstimado}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    valorEstimado: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            {/* Título e Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Título *</label>
              <Input 
                placeholder="Título da proposta" 
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Serviço *</label>
              <Input 
                placeholder="Ex: Instalação elétrica, Reforma, etc." 
                value={formData.tipoServico}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoServico: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição do Escopo *</label>
              <Textarea 
                placeholder="Descreva detalhadamente o que será executado"
                rows={4}
                value={formData.descricaoEscopo}
                onChange={(e) => setFormData(prev => ({ ...prev, descricaoEscopo: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato e Execução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Contato *</label>
                <Input 
                  placeholder="Nome do responsável" 
                  value={formData.contatoNome}
                  onChange={(e) => setFormData(prev => ({ ...prev, contatoNome: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email do Contato *</label>
                <Input 
                  type="email"
                  placeholder="email@exemplo.com" 
                  value={formData.contatoEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contatoEmail: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone do Contato</label>
              <Input 
                placeholder="(11) 99999-9999" 
                value={formData.contatoTelefone}
                onChange={(e) => setFormData(prev => ({ ...prev, contatoTelefone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Endereço de Execução *</label>
              <Textarea 
                placeholder="Endereço completo onde o serviço será executado"
                rows={3}
                value={formData.localExecucaoEndereco}
                onChange={(e) => setFormData(prev => ({ ...prev, localExecucaoEndereco: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Prazos e Validade */}
        <Card>
          <CardHeader>
            <CardTitle>Prazos e Validade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prazo para Aceite (dias)</label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  placeholder="7"
                  value={formData.tempoParaAceite}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    tempoParaAceite: parseInt(e.target.value) || 7 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Validade da Proposta</label>
                <Input
                  type="date"
                  value={formData.validadeProposta}
                  onChange={(e) => setFormData(prev => ({ ...prev, validadeProposta: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prazo de Execução (dias)</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.prazoExecucaoEstimadoDias}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prazoExecucaoEstimadoDias: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Janela de Execução Preferencial</label>
              <Input 
                placeholder="Ex: Seg-Sex, 8h-17h" 
                value={formData.janelaExecucaoPreferencial}
                onChange={(e) => setFormData(prev => ({ ...prev, janelaExecucaoPreferencial: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Restrições de Acesso</label>
              <Textarea 
                placeholder="Ex: Condomínio exige cadastro até D-2"
                rows={2}
                value={formData.restricoesDeAcesso}
                onChange={(e) => setFormData(prev => ({ ...prev, restricoesDeAcesso: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissões e Conformidades */}
        <Card>
          <CardHeader>
            <CardTitle>Permissões e Conformidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Requer Permites?</label>
                <Select 
                  value={formData.permite} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    permite: value as StatusPermite 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusPermite.NAO}>Não</SelectItem>
                    <SelectItem value={StatusPermite.SIM}>Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.permite === StatusPermite.SIM && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quais Permites? *</label>
                  <Input 
                    placeholder="Descreva os permites necessários"
                    value={formData.quaisPermites}
                    onChange={(e) => setFormData(prev => ({ ...prev, quaisPermites: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Normas e Referências</label>
              <Textarea 
                placeholder="Ex: NEC 2023, ABNT NBR 5410"
                rows={2}
                value={formData.normasReferencias}
                onChange={(e) => setFormData(prev => ({ ...prev, normasReferencias: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Inspeções Necessárias</label>
              <Textarea 
                placeholder="Ex: Inspeção final elétrica"
                rows={2}
                value={formData.inspecoesNecessarias}
                onChange={(e) => setFormData(prev => ({ ...prev, inspecoesNecessarias: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Valores e Condições Comerciais */}
        <Card>
          <CardHeader>
            <CardTitle>Valores e Condições Comerciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Estimado (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.valorEstimado}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    valorEstimado: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Final ao Cliente (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.precoPropostaCliente}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    precoPropostaCliente: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Desconto Ofertado (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.descontosOfertados}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    descontosOfertados: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gatilho de Faturamento</label>
                <Select 
                  value={formData.gatilhoFaturamento} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    gatilhoFaturamento: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NA_APROVACAO">Na Aprovação</SelectItem>
                    <SelectItem value="POR_MARCOS">Por Marcos</SelectItem>
                    <SelectItem value="NA_ENTREGA">Na Entrega</SelectItem>
                    <SelectItem value="CUSTOMIZADO">Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.gatilhoFaturamento === 'NA_APROVACAO' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Percentual do Sinal (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={formData.percentualSinal}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    percentualSinal: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Garantia</label>
              <Textarea 
                placeholder="Ex: 12 meses mão de obra; 3 meses materiais"
                rows={2}
                value={formData.garantia}
                onChange={(e) => setFormData(prev => ({ ...prev, garantia: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exclusões</label>
              <Textarea 
                placeholder="O que não está incluso na proposta"
                rows={3}
                value={formData.exclusoes}
                onChange={(e) => setFormData(prev => ({ ...prev, exclusoes: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Condições Gerais</label>
              <Textarea 
                placeholder="Termos contratuais, prazos, multas, SLA de atendimento"
                rows={3}
                value={formData.condicoesGerais}
                onChange={(e) => setFormData(prev => ({ ...prev, condicoesGerais: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Instruções de Pagamento</label>
              <Textarea 
                placeholder="Como realizar o pagamento"
                rows={2}
                value={formData.instrucoesPagamento}
                onChange={(e) => setFormData(prev => ({ ...prev, instrucoesPagamento: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Observações e Riscos */}
        <Card>
          <CardHeader>
            <CardTitle>Observações e Riscos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações para o Cliente</label>
              <Textarea 
                placeholder="Informações que aparecerão na proposta para o cliente"
                rows={3}
                value={formData.observacoesParaCliente}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoesParaCliente: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Riscos Identificados</label>
              <Textarea 
                placeholder="Ex: Infiltração na fachada pode atrasar prazos"
                rows={2}
                value={formData.riscosIdentificados}
                onChange={(e) => setFormData(prev => ({ ...prev, riscosIdentificados: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissões e Conformidades */}
        <Card>
          <CardHeader>
            <CardTitle>Permissões e Conformidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Requer Permites?</label>
                <Select 
                  value={formData.permite} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    permite: value as StatusPermite 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusPermite.NAO}>Não</SelectItem>
                    <SelectItem value={StatusPermite.SIM}>Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.permite === StatusPermite.SIM && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quais Permites? *</label>
                  <Input 
                    placeholder="Descreva os permites necessários"
                    value={formData.quaisPermites}
                    onChange={(e) => setFormData(prev => ({ ...prev, quaisPermites: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Etapas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Etapas do Trabalho</CardTitle>
              <Button type="button" variant="outline" onClick={addEtapa}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.etapas.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma etapa adicionada. Clique em "Adicionar Etapa" para começar.
              </p>
            ) : (
              formData.etapas.map((etapa, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Etapa {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEtapa(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título *</label>
                        <Input 
                          placeholder="Nome da etapa"
                          value={etapa.titulo}
                          onChange={(e) => updateEtapa(index, 'titulo', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Valor Estimado (USD)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={etapa.valorEstimado}
                          onChange={(e) => updateEtapa(index, 'valorEstimado', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea 
                        placeholder="Descrição detalhada da etapa"
                        rows={2}
                        value={etapa.descricao}
                        onChange={(e) => updateEtapa(index, 'descricao', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Materiais */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Materiais</CardTitle>
              <Button type="button" variant="outline" onClick={addMaterial}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.materiais.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum material adicionado. Clique em "Adicionar Material" para começar.
              </p>
            ) : (
              formData.materiais.map((material, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Material {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome *</label>
                        <Input 
                          placeholder="Nome do material"
                          value={material.nome}
                          onChange={(e) => updateMaterial(index, 'nome', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantidade *</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="1"
                          value={material.quantidade}
                          onChange={(e) => updateMaterial(index, 'quantidade', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Unidade *</label>
                        <Input 
                          placeholder="ex: un, m², kg"
                          value={material.unidade}
                          onChange={(e) => updateMaterial(index, 'unidade', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Valor Unitário (USD)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={material.valorUnitario}
                          onChange={(e) => updateMaterial(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fornecedor</label>
                        <Input 
                          placeholder="Nome do fornecedor"
                          value={material.fornecedor}
                          onChange={(e) => updateMaterial(index, 'fornecedor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea 
                        placeholder="Descrição detalhada do material"
                        rows={2}
                        value={material.descricao}
                        onChange={(e) => updateMaterial(index, 'descricao', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 mt-4">
                      <label className="text-sm font-medium">Observações</label>
                      <Textarea 
                        placeholder="Observações adicionais"
                        rows={2}
                        value={material.observacoes}
                        onChange={(e) => updateMaterial(index, 'observacoes', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/propostas">Cancelar</Link>
          </Button>
          
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Proposta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
