"use client"

import { Sidebar } from "@/components/GladPros"
import { useRouter } from "next/navigation"
import { useToast } from "./ui/Toaster"
import { useConfirm } from "./ui/ConfirmDialog"
import React from "react"

import { DEFAULT_NAV } from "@/components/GladPros";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { showToast } = useToast()
  const { confirm, Dialog } = useConfirm()
  const [collapsed, setCollapsed] = React.useState(false)

  async function handleLogout() {
    const ok = await confirm({ title: 'Sair', message: 'Deseja encerrar a sessão?', confirmText: 'Sair', tone: 'danger' })
    if (!ok) return
    const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    if (res.ok) {
      showToast({ title: 'Até logo', message: 'Sessão encerrada', type: 'success' })
      router.push('/login')
    } else {
      let msg = 'Não foi possível sair'
      try { const j = await res.json(); msg = j?.error || msg } catch {}
      showToast({ title: 'Erro', message: msg, type: 'error' })
    }
  }

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/dashboard'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        nav={DEFAULT_NAV}
        activeHref={pathname}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-auto">{children}</div>
      <Dialog />
    </div>
  )
}

export function Panel({ title, badge, className = "", children }: {
  title: string;
  badge?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-title text-lg">{title}</h3>
        {typeof badge === "number" && (
          <span className="rounded-full bg-[#3E4095] px-2 py-0.5 text-xs text-white dark:bg-[#0098DA]">{badge}</span>
        )}
      </div>
      {children ? (
        <div>{children}</div>
      ) : (
        <div className="grid h-44 place-content-center rounded-2xl border border-dashed border-gray-300 text-sm opacity-60 dark:border-gray-600">
          Área para gráficos/visualizações
        </div>
      )}
    </div>
  )
}
