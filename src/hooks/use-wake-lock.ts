"use client"

import { useEffect } from "react"

/** Evita que el móvil se bloquee mientras la mesa está en directo. */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== "visible") return
      try {
        sentinel = await navigator.wakeLock.request("screen")
        if (cancelled) await sentinel.release()
      } catch {
        // Sin batería suficiente o sin permiso: no es crítico.
      }
    }

    // El navegador suelta el bloqueo al cambiar de pestaña; lo recuperamos al volver.
    const onVisibility = () => void acquire()
    void acquire()
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibility)
      void sentinel?.release().catch(() => {})
    }
  }, [enabled])
}
