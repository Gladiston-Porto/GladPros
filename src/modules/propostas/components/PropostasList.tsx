'use client'

import { useState, useEffect } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  Download,
  Filter,
  X
} from 'lucide-react'
import { PropostaWithRelations, StatusProposta } from '@/types/propostas'
import Link from 'next/link'
import { ChangeEvent } from 'react'

// Status color mapping
const statusColors: Record<StatusProposta, string> = {
  [StatusProposta.RASCUNHO]: 'bg-gray-100 text-gray-800',
  [StatusProposta.ENVIADA]: 'bg-blue-100 text-blue-800',
  [StatusProposta.ASSINADA]: 'bg-yellow-100 text-yellow-800',
  [StatusProposta.APROVADA]: 'bg-green-100 text-green-800',
  [StatusProposta.CANCELADA]: 'bg-red-100 text-red-800',
}

interface PropostasListProps {
  userRole: string
}

interface Filters {
  busca: string
  status?: StatusProposta
  clienteId?: string
  dataInicio?: string
  dataFim?: string
}

export default function PropostasList({ userRole }: PropostasListProps) {
  const [propostas, setPropostas] = useState<PropostaWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<Filters>({ busca: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [clientes, setClientes] = useState<Array<{id: string, nome: string}>>([])
  
  const { toast } = useToast()

  // Load propostas
  const loadPropostas = async (reset = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (!reset && cursor) params.append('cursor', cursor)
      if (filters.busca) params.append('busca', filters.busca)
      if (filters.status) params.append('status', filters.status)
      if (filters.clienteId) params.append('clienteId', filters.clienteId)
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio)
      if (filters.dataFim) params.append('dataFim', filters.dataFim)

      const response = await fetch(`/api/propostas?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar propostas')
      }

      const data = await response.json()
      
      if (reset) {
        setPropostas(data.propostas)
      } else {
        setPropostas(prev => [...prev, ...data.propostas])
      }
      
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as propostas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Load clients for filter
  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setClientes(data.clientes || [])
      }
    } catch (error) {
      // Silent fail for filter options
    }
  }

  // Delete proposta
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/propostas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir proposta')
      }

      setPropostas(prev => prev.filter(p => p.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Proposta excluída com sucesso'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a proposta',
        variant: 'destructive'
      })
    }
  }

  // Apply filters
  const applyFilters = () => {
    setCursor(null)
    loadPropostas(true)
    setShowFilters(false)
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({ busca: '' })
    setCursor(null)
    loadPropostas(true)
    setShowFilters(false)
  }

  // Format currency for display (mask values for some roles)
  const formatCurrency = (value: number) => {
    if (userRole === 'VENDEDOR' || userRole === 'OPERACIONAL') {
      return 'USD ●●●●●'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  useEffect(() => {
    loadPropostas(true)
    loadClientes()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Propostas</h1>
          <p className="text-muted-foreground">
            Gerencie propostas comerciais
          </p>
        </div>
        <Button asChild>
          <Link href="/propostas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por número, cliente ou descrição..."
                  value={filters.busca}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, busca: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <Button onClick={() => loadPropostas(true)}>
              Buscar
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  value={filters.status}
                  onValueChange={(value: StatusProposta) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusProposta.RASCUNHO}>Rascunho</SelectItem>
                    <SelectItem value={StatusProposta.ENVIADA}>Enviada</SelectItem>
                    <SelectItem value={StatusProposta.ASSINADA}>Assinada</SelectItem>
                    <SelectItem value={StatusProposta.APROVADA}>Aprovada</SelectItem>
                    <SelectItem value={StatusProposta.CANCELADA}>Cancelada</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.clienteId}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, clienteId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Data início"
                  value={filters.dataInicio}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
                />

                <Input
                  type="date"
                  placeholder="Data fim"
                  value={filters.dataFim}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={applyFilters}>Aplicar Filtros</Button>
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Propostas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && propostas.length === 0 ? (
            <div className="text-center py-8">Carregando...</div>
          ) : propostas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma proposta encontrada
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propostas.map((proposta) => (
                    <TableRow key={proposta.id}>
                      <TableCell className="font-mono">
                        {proposta.numero}
                      </TableCell>
                      <TableCell>{proposta.cliente.nome}</TableCell>
                      <TableCell>{proposta.descricao}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={statusColors[proposta.status]}
                        >
                          {proposta.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(proposta.valorTotal)}</TableCell>
                      <TableCell>
                        {new Date(proposta.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/propostas/${proposta.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            
                            {proposta.status === StatusProposta.RASCUNHO && (
                              <DropdownMenuItem asChild>
                                <Link href={`/propostas/${proposta.id}/editar`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Gerar PDF
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Exportar
                            </DropdownMenuItem>

                            {proposta.status === StatusProposta.RASCUNHO && (
                              <>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir a proposta {proposta.numero}?
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(proposta.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Load More */}
              {hasMore && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadPropostas(false)}
                    disabled={loading}
                  >
                    {loading ? 'Carregando...' : 'Carregar mais'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
