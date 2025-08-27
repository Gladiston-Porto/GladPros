// src/modules/propostas/services/bulkService.ts

/**
 * Run bulk action on selected items
 */
export async function runBulkAction(
  action: string,
  selectedIds: string[],
  onProgress?: (progress: number) => void
): Promise<void> {
  if (selectedIds.length === 0) {
    throw new Error('Nenhum item selecionado')
  }

  let completed = 0
  const total = selectedIds.length

  for (const id of selectedIds) {
    try {
      switch (action) {
        case 'delete':
          await fetch(`/api/propostas/${id}`, { method: 'DELETE' })
          break
        case 'send':
          await fetch(`/api/propostas/${id}/send`, { method: 'POST' })
          break
        default:
          throw new Error(`Ação desconhecida: ${action}`)
      }
    } catch (error) {
      console.error(`Erro ao processar proposta ${id}:`, error)
      // Continue processing others
    }

    completed++
    if (onProgress) {
      onProgress((completed / total) * 100)
    }
  }
}

/**
 * Check if export needs warning due to large number of records
 */
export function needsExportWarning(count: number): boolean {
  return count > 1000
}
