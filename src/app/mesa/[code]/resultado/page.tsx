"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { AuthGate } from "@/components/app-shell"
import { ErrorView } from "@/components/mesa/error-view"
import { ResultView } from "@/components/mesa/result-view"
import { FullScreenLoader } from "@/components/ui"
import { useSession } from "@/hooks/use-session"
import { useAuth } from "@/lib/auth"
import { formatCode, normalizeCode } from "@/lib/code"
import { resultHref, tableHref } from "@/lib/routes"

export default function ResultPage() {
  const params = useParams<{ code: string }>()
  const raw = params.code ?? ""
  const code = normalizeCode(raw)
  return (
    <AuthGate inviteCode={code ?? undefined}>
      <ResultScreen code={code} raw={raw} />
    </AuthGate>
  )
}

function ResultScreen({ code, raw }: { code: string | null; raw: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const { session, players, loading, error, retry } = useSession(code)
  const live = session?.status === "live"

  // Si la mesa sigue abierta, el resultado aún no existe: volvemos a la mesa.
  useEffect(() => {
    if (!code) return
    if (live) router.replace(tableHref(code))
    else if (code !== raw) router.replace(resultHref(code))
  }, [code, raw, live, router])

  if (!user) return null
  if (!code) return <ErrorView kind="not-found" code={decodeURIComponent(raw).toUpperCase()} />
  if (error) return <ErrorView kind="load" code={code} onRetry={retry} />
  if (loading || live) return <FullScreenLoader label="Buscando la mesa…" />
  if (!session) return <ErrorView kind="not-found" code={formatCode(code)} />
  return <ResultView session={session} players={players} uid={user.uid} />
}
