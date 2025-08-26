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
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Edit,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Package,
  FileX
} from 'lucide-react'
import { 
  PropostaWithDetails, 
  StatusProposta, 
  STATUS_COLORS,
  STATUS_LABELS 
} from '@/types/propostas'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface PropostaDetailsProps {
  propostaId: string
}

export default function PropostaDetails({ propostaId }: PropostaDetailsProps) {
  const [proposta, setProposta] = useState<PropostaWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Load proposta details
  const loadProposta = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/propostas/${propostaId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Erro',
            description: 'Proposta não encontrada',
            variant: 'destructive'
          })
          router.push('/propostas')
          return
        }
        throw new Error('Erro ao carregar proposta')
      }

      const data = await response.json()
      setProposta(data)
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a proposta',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Send proposta
  const handleSend = async () => {
    if (!proposta) return
    
    try {
      setActionLoading(true)
      const response = await fetch(`/api/propostas/${propostaId}/send`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar proposta')
      }

      toast({
        title: 'Sucesso',
        description: 'Proposta enviada com sucesso'
      })
      
      await loadProposta()
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a proposta',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel proposta
  const handleCancel = async () => {
    if (!proposta) return
    
    try {
      setActionLoading(true)
      const response = await fetch(`/api/propostas/${propostaId}/cancel`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar proposta')
      }

      toast({
        title: 'Sucesso',
        description: 'Proposta cancelada com sucesso'
      })
      
      await loadProposta()
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a proposta',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    loadProposta()
  }, [propostaId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!proposta) {
    return (
      <div className="text-center py-12">
        <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">Proposta não encontrada</h3>
        <p className="text-gray-600 mb-4">A proposta solicitada não existe ou você não tem permissão para visualizá-la.</p>
        <Button asChild>
          <Link href="/propostas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Propostas
          </Link>
        </Button>
      </div>
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
            <h1 className="text-3xl font-bold">{proposta.numero}</h1>
            <p className="text-muted-foreground">{proposta.descricao}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            className={STATUS_COLORS[proposta.status]}
          >
            {STATUS_LABELS[proposta.status]}
          </Badge>
          
          {proposta.status === StatusProposta.RASCUNHO && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/propostas/${propostaId}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={actionLoading}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Enviar proposta</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja enviar a proposta {proposta.numero}? 
                      Após o envio, não será mais possível editá-la.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSend}>
                      Confirmar Envio
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
          
          {['RASCUNHO', 'ENVIADA'].includes(proposta.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={actionLoading}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar proposta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja cancelar a proposta {proposta.numero}? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar Cancelamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="etapas">Etapas</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Nome:</span>
                  <p className="text-sm">{proposta.cliente.nome}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <p className="text-sm">{proposta.cliente.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Informações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Valor Estimado:</span>
                  <p className="text-lg font-bold">{formatCurrency(proposta.valorEstimado)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Valor Total:</span>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(proposta.valorTotal)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Criada em:</span>
                  <p className="text-sm">{new Date(proposta.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                {proposta.assinaturaData && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Assinada em:</span>
                    <p className="text-sm">{new Date(proposta.assinaturaData).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Última atualização:</span>
                  <p className="text-sm">{new Date(proposta.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposta.detalhes && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Descrição detalhada:</span>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{proposta.detalhes}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Permite:</span>
                    <p className="text-sm">{proposta.permite === 'SIM' ? 'Sim' : 'Não'}</p>
                  </div>
                  {proposta.quaisPermites && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Quais permites:</span>
                      <p className="text-sm mt-1">{proposta.quaisPermites}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="etapas">
          <Card>
            <CardHeader>
              <CardTitle>Etapas da Proposta</CardTitle>
            </CardHeader>
            <CardContent>
              {proposta.etapas && proposta.etapas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposta.etapas.map((etapa) => (
                      <TableRow key={etapa.id}>
                        <TableCell>{etapa.ordem}</TableCell>
                        <TableCell className="font-medium">{etapa.titulo}</TableCell>
                        <TableCell>{etapa.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{etapa.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(etapa.valorEstimado)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhuma etapa cadastrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiais">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Materiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposta.materiais && proposta.materiais.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Valor Unitário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposta.materiais.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.nome}</TableCell>
                        <TableCell>{material.descricao}</TableCell>
                        <TableCell>{material.quantidade}</TableCell>
                        <TableCell>{material.unidade}</TableCell>
                        <TableCell>{formatCurrency(material.valorUnitario)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{material.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(material.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum material cadastrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anexos">
          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
            </CardHeader>
            <CardContent>
              {proposta.anexos && proposta.anexos.length > 0 ? (
                <div className="space-y-3">
                  {proposta.anexos.map((anexo) => (
                    <div key={anexo.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{anexo.nomeOriginal}</p>
                        <p className="text-sm text-muted-foreground">
                          {(anexo.tamanhoBytes / 1024 / 1024).toFixed(2)} MB • {anexo.mimeType}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum anexo encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Histórico de Alterações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposta.logs && proposta.logs.length > 0 ? (
                <div className="space-y-4">
                  {proposta.logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{log.usuario?.nome}</span> • {log.acao}
                        </p>
                        {log.detalhes && (
                          <p className="text-sm text-muted-foreground mt-1">{log.detalhes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum registro de histórico encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
