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
import { useToast } from '@/components/ui/Toaster'
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
  descricao: string
  detalhes: string
  valorEstimado: number
  permite: StatusPermite
  quaisPermites: string
  etapas: EtapaForm[]
  materiais: MaterialForm[]
}

export default function PropostaForm() {
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState<PropostaFormData>({
    clienteId: '',
    descricao: '',
    detalhes: '',
    valorEstimado: 0,
    permite: StatusPermite.NAO,
    quaisPermites: '',
    etapas: [],
    materiais: []
  })
  const router = useRouter()
  const { showToast } = useToast()

  const toast = (options: any) => {
    showToast({
      title: options.title || '',
      message: options.description || '',
      type: options.variant === 'destructive' ? 'error' : 'success'
    })
  }

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
    
    if (!formData.descricao) {
      toast({
        title: 'Erro',
        description: 'Descrição é obrigatória',
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
      
      toast({
        title: 'Sucesso',
        description: `Proposta ${proposta.numero || 'criada'} com sucesso`
      })

      router.push(`/propostas/${proposta.id}`)

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

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição *</label>
              <Input 
                placeholder="Descrição da proposta" 
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Detalhes</label>
              <Textarea 
                placeholder="Detalhes adicionais sobre a proposta"
                rows={3}
                value={formData.detalhes}
                onChange={(e) => setFormData(prev => ({ ...prev, detalhes: e.target.value }))}
              />
            </div>

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
