"use client"

import { useParams, useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import { AuthGate } from "@/components/app-shell"
import { ErrorView } from "@/components/mesa/error-view"
import { InviteView } from "@/components/mesa/invite-view"
import { LiveView } from "@/components/mesa/live-view"
import { FullScreenLoader } from "@/components/ui"
import { useSession } from "@/hooks/use-session"
import { useAuth } from "@/lib/auth"
import { formatCode, normalizeCode } from "@/lib/code"
import { resultHref, tableHref } from "@/lib/routes"

export default function TablePage() {
  const params = useParams<{ code: string }>()
  const raw = params.code ?? ""
  const code = normalizeCode(raw)
  return (
    <AuthGate inviteCode={code ?? undefined}>
      <Suspense fallback={<FullScreenLoader />}>
        <TableScreen code={code} raw={raw} />
      </Suspense>
    </AuthGate>
  )
}

function TableScreen({ code, raw }: { code: string | null; raw: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const { session, players, playersLoaded, loading, error, retry } = useSession(code)
  const finished = session?.status === "finished"

  // /mesa/k7p2qx → /mesa/K7P2QX, y una mesa cerrada lleva siempre a su resultado.
  useEffect(() => {
    if (!code) return
    if (finished) router.replace(resultHref(code))
    else if (code !== raw) router.replace(tableHref(code))
  }, [code, raw, finished, router])

  if (!user) return null
  if (!code) return <ErrorView kind="not-found" code={decodeURIComponent(raw).toUpperCase()} />
  if (error) return <ErrorView kind="load" code={code} onRetry={retry} />
  if (loading) return <FullScreenLoader label="Buscando la mesa…" />
  if (!session) return <ErrorView kind="not-found" code={formatCode(code)} />
  if (finished) return <FullScreenLoader label="Buscando la mesa…" />
  if (!session.participantIds.includes(user.uid)) return <InviteView session={session} players={players} user={user} />
  return <LiveView session={session} players={players} playersLoaded={playersLoaded} uid={user.uid} />
}
