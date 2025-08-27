"use client"

import React, { createContext, useCallback, useContext, useRef, useState } from "react"

type ConfirmOpts = { title?: string; message?: string; confirmText?: string; cancelText?: string; tone?: "danger" | "default" }

type ConfirmCtx = { confirm: (opts?: ConfirmOpts) => Promise<boolean>; Dialog: React.FC }

const Ctx = createContext<ConfirmCtx | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [opts, setOpts] = useState<ConfirmOpts>({})
  const resolverRef = useRef<((v: boolean) => void) | undefined>(undefined)

  const confirm = useCallback((o?: ConfirmOpts) => {
    setOpts(o || {})
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const resolveWith = (v: boolean) => {
    setOpen(false)
  const r = resolverRef.current
  resolverRef.current = undefined
  if (r) r(v)
  }

  const Dialog: React.FC = () => {
    if (!open) return null
    const title = opts.title || "Confirmar"
    const message = opts.message || "Deseja prosseguir?"
    const confirmText = opts.confirmText || "Confirmar"
    const cancelText = opts.cancelText || "Cancelar"
    const danger = opts.tone === "danger"
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => resolveWith(false)} />
        <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white p-4 text-slate-900 shadow-xl">
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="mb-4 text-sm text-slate-600">{message}</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => resolveWith(false)} className="rounded-md border px-3 py-2 text-sm">{cancelText}</button>
            <button onClick={() => resolveWith(true)} className={`rounded-md px-3 py-2 text-sm text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"}`}>{confirmText}</button>
          </div>
        </div>
      </div>
    )
  }

  return <Ctx.Provider value={{ confirm, Dialog }}>{children}</Ctx.Provider>
}

export function useConfirm() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider")
  return ctx
}

export default ConfirmProvider
