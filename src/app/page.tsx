"use client"

import { ChevronRight, CircleAlert, History, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { JoinByCode } from "@/components/join-by-code"
import { useMySessions } from "@/components/providers"
import { LiveSessionCard, SessionRow } from "@/components/session-card"
import { Button, Empty, Skeleton, Stat, StatGrid } from "@/components/ui"
import { displayNameOf, useAuth } from "@/lib/auth"
import { newTableHref } from "@/lib/routes"
import { personalStats } from "@/lib/stats"
import type { Session } from "@/lib/types"

export default function HomePage() {
  return (
    <AppShell width="wide">
      <Home />
    </AppShell>
  )
}

const SECTION_TITLE = "text-h2 text-ink"

function Home() {
  const { user } = useAuth()
  const { sessions, loading, error, retry } = useMySessions()
  if (!user) return null

  const live = sessions.filter((session) => session.status === "live")
  const finished = sessions.filter((session) => session.status === "finished")
  const firstName = displayNameOf(user).split(/\s+/)[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(420px,1fr))] lg:gap-x-14 lg:gap-y-12">
      {/* Columna izquierda: saludo, mesas en curso y acciones. */}
      <div className="flex min-w-0 flex-col">
        <h1 className="text-title text-ink lg:text-[40px] lg:leading-[46px] lg:tracking-[-0.035em]">Hola, {firstName}</h1>
        <p className="mt-1.5 text-body-lg text-pretty text-ink-2 lg:text-[18px] lg:leading-[26px]">
          {live.length ? "Tienes una mesa en marcha. ¡A por la siguiente pieza!" : "¿Hoy toca libre de sushi?"}
        </p>

        {live.length ? (
          <section aria-labelledby="mesas-en-curso" className="mt-6 flex flex-col gap-2.5 lg:mt-7">
            <h2 id="mesas-en-curso" className="text-[14px] leading-5 font-semibold text-ink-2">
              Mesas en curso
            </h2>
            {live.map((session) => (
              <LiveSessionCard key={session.code} session={session} />
            ))}
          </section>
        ) : null}

        <Link
          href={newTableHref()}
          className="mt-6 flex items-center gap-4 rounded-cta bg-accent p-5 text-accent-on transition-[transform,filter] duration-[90ms] ease-out select-none hover:brightness-108 active:scale-[0.98] active:brightness-90 lg:p-[22px]"
        >
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-current">
            <Plus size={28} strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[22px] leading-7 font-semibold tracking-[-0.01em]">Nueva mesa</span>
            <span className="mt-0.5 block text-[14px] leading-5 text-pretty">
              Crea la mesa e invita a los demás con un código o QR.
            </span>
          </span>
          <ChevronRight size={22} className="shrink-0" aria-hidden />
        </Link>

        <JoinByCode className="mt-7" />
      </div>

      {/* Columna derecha (en escritorio): números y últimas mesas. */}
      <div className="mt-9 flex min-w-0 flex-col lg:mt-0">
        <section aria-labelledby="tus-numeros">
          <h2 id="tus-numeros" className={SECTION_TITLE}>
            Tus números
          </h2>
          {error ? (
            <div className="mt-2">
              <Empty
                icon={CircleAlert}
                title="No se han podido cargar tus mesas."
                action={
                  <Button kind="secondary" icon={RefreshCw} onClick={retry}>
                    Reintentar
                  </Button>
                }
              >
                Revisa tu conexión e inténtalo otra vez.
              </Empty>
            </div>
          ) : loading ? (
            <StatsSkeleton />
          ) : (
            <Stats sessions={sessions} uid={user.uid} />
          )}
        </section>

        {error ? null : loading ? (
          <RecentSkeleton />
        ) : (
          <section aria-labelledby="ultimas-mesas" className="mt-9">
            <div className="flex min-h-11 items-center justify-between gap-4">
              <h2 id="ultimas-mesas" className={SECTION_TITLE}>
                Últimas mesas
              </h2>
              {finished.length > 3 ? (
                <Link
                  href="/historial"
                  className="-mr-1 flex min-h-11 items-center gap-0.5 rounded-input px-1 text-[15px] leading-none font-semibold text-accent-ink hover:underline hover:underline-offset-4"
                >
                  Ver todo
                  <ChevronRight size={18} aria-hidden />
                </Link>
              ) : null}
            </div>
            {finished.length ? (
              <ul className="border-t border-line lg:mt-2">
                {finished.slice(0, 3).map((session) => (
                  <SessionRow key={session.code} session={session} uid={user.uid} />
                ))}
              </ul>
            ) : (
              <div className="border-t border-line">
                <Empty icon={History} title="Aún no hay mesas">
                  Cuando cerréis vuestra primera mesa aparecerá aquí con el resultado.
                </Empty>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function Stats({ sessions, uid }: { sessions: Session[]; uid: string }) {
  const stats = personalStats(sessions, uid)
  return (
    <StatGrid className="mt-3.5">
      <Stat label="Piezas" value={stats.pieces.toLocaleString("es-ES")} />
      <Stat label="Mesas" value={stats.sessions} sub={`${Math.round(stats.average)} de media`} />
      <Stat label="Victorias" value={stats.wins} sub={`de ${stats.groupSessions} en grupo`} />
      <Stat label="Récord" value={stats.best} sub="piezas en una mesa" />
    </StatGrid>
  )
}

function StatsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando tus números"
      className="mt-3.5 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line"
    >
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex flex-col gap-2.5 bg-bg p-4">
          <Skeleton className="h-3 w-[50px] rounded-md" />
          <Skeleton className="h-[30px] w-[72px] rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      ))}
    </div>
  )
}

function RecentSkeleton() {
  return (
    <div className="mt-9" aria-hidden>
      <Skeleton className="h-6 w-[150px] rounded-lg" />
      <div className="mt-3 border-t border-line">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex items-center gap-4 border-b border-line py-4">
            <Skeleton className="h-9 w-[60px] shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-[70%] rounded-[7px]" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
