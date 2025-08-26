"use client"

import DashboardCards from '../components/DashboardCards'
import { useDashboardData } from '../hooks/useDashboardData'

export default function DashboardPage() {
  const { dados, loading } = useDashboardData()

  return (
    <main className="mx-auto max-w-[1440px] p-4 sm:p-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <DashboardCards dados={dados} />
        </div>
      )}
    </main>
  )
}