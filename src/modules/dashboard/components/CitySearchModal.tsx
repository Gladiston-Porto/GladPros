'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

type Place = {
  id: number
  name: string
  admin1?: string
  country_code?: string
}

export default function CitySearchModal({
  isOpen,
  onClose,
  onSelect,
  placeholder = 'Pesquisar cidade... (ex.: Plano, TX)'
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (cityLabel: string) => void
  placeholder?: string
}) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Place[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const debRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setQ('')
      setResults([])
      setLoading(false)
      abortRef.current?.abort()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (debRef.current) window.clearTimeout(debRef.current)
    if (!q || q.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    debRef.current = window.setTimeout(async () => {
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      setLoading(true)
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=pt&format=json`
        const res = await fetch(url, { signal: ac.signal, cache: 'no-store' })
        if (!res.ok) throw new Error('geocoding fail')
        const json: unknown = await res.json()
        const results = (json && typeof json === 'object' && Array.isArray((json as Record<string, unknown>).results))
          ? (json as { results: Array<Record<string, unknown>> }).results
          : []
        const list: Place[] = results
          .map((p) => ({
            id: Number(p.id),
            name: String(p.name ?? ''),
            admin1: typeof p.admin1 === 'string' ? p.admin1 : undefined,
            country_code: typeof p.country_code === 'string' ? p.country_code : undefined,
          }))
          .filter((p) => p.id > 0 && p.name.length > 0)
        setResults(list)
      } catch {
        if (!ac.signal.aborted) setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)
  }, [q, isOpen])

  function label(p: Place) {
    return `${p.name}${p.admin1 ? `, ${p.admin1}` : ''}${p.country_code ? `, ${p.country_code}` : ''}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-4 w-4 text-gp-blue" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto px-2 py-2">
          {loading && (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">Buscando…</div>
          )}
          {!loading && results.length === 0 && q && q.length >= 2 && (
            <div className="px-3 py-3 text-sm text-gray-500">Nenhum resultado para “{q}”.</div>
          )}
          <ul className="space-y-1">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gp-blue/5"
                  onClick={() => {
                    onSelect(label(p))
                    onClose()
                  }}
                >
                  <span className="font-medium text-gp-blue-dark">{p.name}</span>
                  {p.admin1 || p.country_code ? (
                    <span className="text-gp-blue/70">, {p.admin1 ?? ''}{p.admin1 && p.country_code ? ', ' : ''}{p.country_code ?? ''}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>

          {!q && (
            <div className="px-3 py-3 text-xs text-gray-500">
              Dica: pesquise “Plano, TX”, “São Paulo”, “Lisbon”, “New York, NY”…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}