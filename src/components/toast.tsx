"use client"

import { CircleAlert, CircleCheck, Info } from "lucide-react"
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import { cx } from "./ui"

type Tone = "info" | "success" | "error"

interface Toast {
  id: number
  message: string
  tone: Tone
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const show = useCallback((message: string, tone: Tone = "info") => {
    const id = ++nextId.current
    setToasts((current) => [...current.slice(-2), { id, message, tone }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200)
  }, [])

  const value = useMemo(() => show, [show])

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex max-w-sm animate-slide-up items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium shadow-card"
          >
            {toast.tone === "success" ? (
              <CircleCheck className="size-5 shrink-0 text-wasabi" />
            ) : toast.tone === "error" ? (
              <CircleAlert className="size-5 shrink-0 text-danger" />
            ) : (
              <Info className={cx("size-5 shrink-0 text-accent")} />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
