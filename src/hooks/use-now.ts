"use client"

import { useEffect, useState } from "react"

export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, enabled])
  return now
}
