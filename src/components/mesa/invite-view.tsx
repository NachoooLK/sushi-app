"use client"

import type { User } from "firebase/auth"
import { CircleAlert, Eye, MapPin } from "lucide-react"
import { useMemo, useState } from "react"
import { formatCode } from "@/lib/code"
import { joinSession, SessionError } from "@/lib/sessions"
import { rankPlayers } from "@/lib/stats"
import type { Player, Session } from "@/lib/types"
import { RankList } from "../rank-list"
import { useToast } from "../toast"
import { AvatarStack, Button } from "../ui"
import { MesaHeader, whereLine } from "./header"

export function InviteView({ session, players, user }: { session: Session; players: Player[]; user: User }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ranked = useMemo(() => rankPlayers(players), [players])
  const diners = session.participantIds.length
  const full = diners >= session.maxPlayers
  const where = whereLine(session)

  async function join() {
    setBusy(true)
    setError(null)
    try {
      await joinSession(user, session.code)
      toast(`¡Dentro! Bienvenido a ${session.name}.`, "success")
    } catch (caught) {
      setError(caught instanceof SessionError ? caught.message : "No se ha podido entrar en la mesa. Inténtalo de nuevo.")
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh">
      <MesaHeader title="Invitación" subtitle={<span className="tracking-[0.02em]">Mesa {formatCode(session.code)}</span>} />
      <main className="mx-auto flex flex-col px-6 pt-5 pb-11 md:max-w-[560px] lg:pt-12">
        <p className="text-base leading-[22px] text-ink-2">{session.hostName} te invita a</p>
        <h2 className="mt-1.5 text-[32px] leading-[38px] font-semibold tracking-[-0.03em] text-balance text-ink">{session.name}</h2>
        {where ? (
          <p className="mt-2.5 flex items-center gap-2 text-body text-ink-2">
            <MapPin size={18} className="shrink-0" aria-hidden />
            {where}
          </p>
        ) : null}
        <div className="mt-[18px] flex items-center gap-3">
          {ranked.length ? <AvatarStack people={ranked} size={32} /> : null}
          <p className="text-[15px] leading-5 font-medium text-ink tabular-nums">
            {diners} de {session.maxPlayers} comensales
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <Button size="lg" full onClick={join} loading={busy} disabled={full}>
            {full ? "Mesa llena" : "Unirme a la mesa"}
          </Button>
          {error ? (
            <p role="alert" className="flex items-start gap-2 text-[14px] leading-5 font-medium text-danger">
              <CircleAlert size={18} className="shrink-0" aria-hidden />
              <span>{error}</span>
            </p>
          ) : null}
        </div>

        {ranked.length ? (
          <section className="mt-9">
            <div className="flex items-baseline justify-between pb-1.5">
              <h3 className="text-[20px] leading-[26px] font-semibold tracking-[-0.01em] text-ink">Así va la mesa</h3>
              <span className="flex items-center gap-1.5 text-[13px] leading-none font-medium text-ink-3">
                <Eye size={16} aria-hidden />
                Solo lectura
              </span>
            </div>
            <div className="px-3">
              <RankList entries={ranked} hostId={session.hostId} />
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
