'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sun, CloudRain, CloudSnow, Cloud, CloudSun, Thermometer } from 'lucide-react'

type WeatherData = { city: string; temp: number; feelsLike: number; condition: string; description: string }

function iconFor(condition: string) {
  const c = condition.toLowerCase()
  if (c.includes('rain') || c.includes('drizzle')) return CloudRain
  if (c.includes('snow')) return CloudSnow
  if (c.includes('cloud')) return CloudSun
  if (c.includes('clear')) return Sun
  return Cloud
}

export default function WeatherBadge({ city = 'São Paulo', onClick }: { city?: string; onClick?: () => void }) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      if (!res.ok) throw new Error('fail')
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [city])

  useEffect(() => {
    load()
    const id = setInterval(load, 15 * 60 * 1000)
    return () => clearInterval(id)
  }, [load])

  const Icon = data ? iconFor(data.condition) : Thermometer

  // Troque o botão para abrir a busca (e não recarregar aqui)
  return (
    <button
      onClick={onClick}
      title={data?.description ? `${data.city}: ${data.description}` : 'Trocar cidade'}
      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-white/90 hover:bg-white/10 border border-white/10"
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{loading ? '—°' : `${data?.temp ?? '—'}°C`}</span>
    </button>
  )
}