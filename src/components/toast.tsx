"use client"

import { CircleAlert, CircleCheckBig, Info } from "lucide-react"
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
import { cx } from "./ui"

type Tone = "info" | "success" | "error"

interface Toast {
  id: number
  message: string
  tone: Tone
  leaving: boolean
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {})

const ICONS = {
  info: <Info size={22} className="text-ink-2" aria-hidden />,
  success: <CircleCheckBig size={22} className="text-accent-ink" aria-hidden />,
  error: <CircleAlert size={22} className="text-danger" aria-hidden />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const show = useCallback((message: string, tone: Tone = "info") => {
    const id = ++nextId.current
    setToasts((current) => [...current.slice(-2), { id, message, tone, leaving: false }])
    window.setTimeout(() => {
      setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)))
    }, 3000)
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3180)
  }, [])

  return (
    <ToastContext value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+4px)] z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cx(
              "pointer-events-auto flex w-full max-w-[420px] animate-toast-in items-start gap-3 rounded-2xl border border-line bg-raised px-4 py-3.5 text-body font-medium text-ink shadow-pop transition-[opacity,transform] duration-[180ms]",
              toast.leaving && "-translate-y-3 opacity-0",
            )}
          >
            <span className="flex shrink-0">{ICONS[toast.tone]}</span>
            <span className="min-w-0 flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
