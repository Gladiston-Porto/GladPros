import { ClienteFilters } from '@/types/cliente'

export type BulkAction = 'activate' | 'deactivate' | 'delete'
export type BulkScope = 'selected' | 'allFiltered'

export async function runBulkAction(opts: {
  action: BulkAction,
  scope: BulkScope,
  ids?: number[],
  filters?: Partial<ClienteFilters>
}): Promise<{ processed: number }> {
  const res = await fetch('/api/clientes/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts)
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || 'Falha na ação em lote')
  }
  return res.json()
}

export function needsExportWarning(count: number, threshold = 500) {
  return count > threshold
}
