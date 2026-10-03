"use client"

import { CircleAlert, History as HistoryIcon, Plus, RefreshCw } from "lucide-react"
import { useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { useMySessions } from "@/components/providers"
import { SessionRow } from "@/components/session-card"
import { Button, ButtonLink, cx, Empty } from "@/components/ui"
import { useAuth } from "@/lib/auth"
import { formatMonth } from "@/lib/format"
import { newTableHref } from "@/lib/routes"
import type { Session } from "@/lib/types"

export default function HistoryPage() {
  return (
    <AppShell width="list">
      <History />
    </AppShell>
  )
}

/** "En curso" primero y después un grupo por mes, en el orden (más recientes primero) de la lista. */
function groupSessions(sessions: Session[]) {
  const live = sessions.filter((session) => session.status === "live")
  const groups = new Map<string, Session[]>()
  for (const session of sessions) {
    if (session.status === "live") continue
    const label = formatMonth(session.finishedAt ?? session.createdAt ?? new Date())
    groups.set(label, [...(groups.get(label) ?? []), session])
  }
  return [...(live.length ? [["En curso", live] as const] : []), ...groups.entries()]
}

function History() {
  const { user } = useAuth()
  const { sessions, loading, error, retry } = useMySessions()
  const groups = useMemo(() => groupSessions(sessions), [sessions])
  if (!user) return null

  return (
    <>
      <header>
        <h1 className="text-title text-ink lg:text-[40px] lg:leading-[46px] lg:tracking-[-0.035em]">Historial</h1>
        <p className="mt-1.5 text-body-lg text-ink-2 lg:text-[18px] lg:leading-[26px]">
          Todas las mesas en las que has comido.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border-t border-line">
          <Empty
            icon={CircleAlert}
            title="No se ha podido cargar el historial."
            action={
              <Button kind="secondary" icon={RefreshCw} onClick={retry}>
                Reintentar
              </Button>
            }
          >
            Revisa tu conexión e inténtalo otra vez.
          </Empty>
        </div>
      ) : loading && sessions.length === 0 ? (
        <HistorySkeleton />
      ) : sessions.length === 0 ? (
        <div className="mt-8 border-t border-line">
          <Empty
            icon={HistoryIcon}
            title="Tu historial está vacío"
            action={
              <ButtonLink href={newTableHref()} icon={Plus}>
                Crear mi primera mesa
              </ButtonLink>
            }
          >
            Crea una mesa o únete a la de tus amigos para empezar a contar.
          </Empty>
        </div>
      ) : (
        groups.map(([label, items]) => (
          <section key={label} aria-label={label}>
            <h2 className="mt-7 pb-2 text-[14px] leading-5 font-semibold text-ink-2">{label}</h2>
            <ul className="border-t border-line">
              {items.map((session) => (
                <SessionRow key={session.code} session={session} uid={user.uid} />
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  )
}

function Bone({ className }: { className: string }) {
  return <span aria-hidden className={cx("block shrink-0 animate-skeleton bg-sf", className)} />
}

function HistorySkeleton() {
  return (
    <div role="status" aria-label="Cargando el historial">
      <Bone className="mt-7 h-4 w-[90px] rounded-lg" />
      <div className="mt-3 border-t border-line">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-line py-4">
            <Bone className="h-9 w-[60px] rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Bone className="h-3.5 w-[65%] rounded-[7px]" />
              <Bone className="h-3 w-[45%] rounded-md" />
              <Bone className="h-[11px] w-[55%] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
