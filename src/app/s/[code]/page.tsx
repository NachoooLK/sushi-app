"use client"

import { SearchX } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Suspense, useEffect } from "react"
import { AuthGate } from "@/components/app-shell"
import { JoinView } from "@/components/session/join-view"
import { LiveView } from "@/components/session/live-view"
import { ResultsView } from "@/components/session/results-view"
import { FullScreenLoader } from "@/components/ui"
import { useSession } from "@/hooks/use-session"
import { useAuth } from "@/lib/auth"
import { formatCode, normalizeCode } from "@/lib/code"

export default function SessionPage() {
  const params = useParams<{ code: string }>()
  const code = normalizeCode(params.code ?? "")
  return (
    <AuthGate inviteCode={code ?? undefined}>
      <Suspense fallback={<FullScreenLoader />}>
        <SessionScreen code={code} raw={params.code ?? ""} />
      </Suspense>
    </AuthGate>
  )
}

function SessionScreen({ code, raw }: { code: string | null; raw: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const { session, players, loading, error } = useSession(code)

  // /s/k7p2qx → /s/K7P2QX, para que el enlace compartido sea siempre el mismo.
  useEffect(() => {
    if (code && code !== raw) router.replace(`/s/${code}`)
  }, [code, raw, router])

  if (!user) return null
  if (!code) return <NotFound />
  if (loading) return <FullScreenLoader label="Buscando la mesa…" />
  if (error) return <NotFound code={code} message={error} />
  if (!session) return <NotFound code={code} />

  if (session.status === "finished") return <ResultsView session={session} players={players} uid={user.uid} />
  if (!session.participantIds.includes(user.uid)) return <JoinView session={session} players={players} user={user} />
  return <LiveView session={session} players={players} uid={user.uid} />
}

function NotFound({ code, message }: { code?: string; message?: string }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
      <div>
        <SearchX className="mx-auto size-12 text-muted" />
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
          {code ? `No encontramos la mesa ${formatCode(code)}` : "Ese código no es válido"}
        </h1>
        <p className="mt-2 text-muted">
          {message ?? "Revisa el código con quien te lo pasó: son 6 caracteres, sin la letra O ni el número 0."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 font-semibold text-accent-ink"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  )
}
