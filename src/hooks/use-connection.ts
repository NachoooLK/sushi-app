"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"
import { getPendingTaps, subscribePendingTaps } from "@/lib/sessions"

function subscribeOnline(listener: () => void) {
  window.addEventListener("online", listener)
  window.addEventListener("offline", listener)
  return () => {
    window.removeEventListener("online", listener)
    window.removeEventListener("offline", listener)
  }
}

/** Estado de la red y toques pendientes de confirmar; avisa una vez cuando se vacía la cola tras un corte. */
export function useConnection(onSynced?: () => void) {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)
  const pending = useSyncExternalStore(subscribePendingTaps, getPendingTaps, () => 0)
  const wasBehind = useRef(false)

  useEffect(() => {
    if (!online && pending > 0) wasBehind.current = true
    if (online && pending === 0 && wasBehind.current) {
      wasBehind.current = false
      onSynced?.()
    }
  }, [online, pending, onSynced])

  return { online, pending }
}
