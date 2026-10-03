"use client"

import { Check, LogOut, Pencil } from "lucide-react"
import { useState, type FormEvent } from "react"
import { AppShell } from "@/components/app-shell"
import { Credits } from "@/components/credits"
import { useMySessions } from "@/components/providers"
import { useToast } from "@/components/toast"
import { Avatar, Button, Card, SectionTitle, StatTile } from "@/components/ui"
import { displayNameOf, signOut, updateDisplayName, useAuth } from "@/lib/auth"
import { decimal } from "@/lib/format"
import { personalStats } from "@/lib/stats"

export default function ProfilePage() {
  return (
    <AppShell>
      <Profile />
    </AppShell>
  )
}

function Profile() {
  const { user, refresh } = useAuth()
  const { sessions } = useMySessions()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  if (!user) return null

  const stats = personalStats(sessions, user.uid)
  const winRate = stats.groupSessions ? Math.round((stats.wins / stats.groupSessions) * 100) : null

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!user || !name.trim()) return
    setBusy(true)
    try {
      await updateDisplayName(user, name)
      refresh()
      setEditing(false)
      toast("Nombre actualizado. Se usará en tus próximas mesas.", "success")
    } catch {
      toast("No se ha podido cambiar el nombre.", "error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={displayNameOf(user)} photoURL={user.photoURL} seed={user.uid} size={64} />
          <div className="min-w-0 flex-1">
            {editing ? (
              <form onSubmit={save} className="flex gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={40}
                  aria-label="Tu nombre"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
                />
                <Button type="submit" size="sm" className="h-11" loading={busy} aria-label="Guardar nombre">
                  <Check className="size-4" />
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setName(displayNameOf(user))
                  setEditing(true)
                }}
                className="group flex max-w-full items-center gap-2 text-left"
              >
                <span className="truncate font-display text-2xl font-extrabold tracking-tight">{displayNameOf(user)}</span>
                <Pencil className="size-4 shrink-0 text-muted group-hover:text-ink" aria-label="Cambiar nombre" />
              </button>
            )}
            <p className="mt-0.5 truncate text-sm text-muted">{user.isAnonymous ? "Cuenta de invitado" : user.email}</p>
          </div>
        </div>
      </Card>

      <section>
        <SectionTitle>Tu carrera sushera</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Piezas totales" value={stats.pieces.toLocaleString("es-ES")} tone="accent" />
          <StatTile label="Récord" value={stats.best} hint="en una mesa" tone="wasabi" />
          <StatTile label="Mesas" value={stats.sessions} hint={`${stats.groupSessions} en grupo`} />
          <StatTile label="Media" value={decimal(stats.average)} hint="piezas por mesa" />
          <StatTile
            label="Victorias"
            value={stats.wins}
            hint={winRate !== null ? `${winRate}% de las mesas en grupo` : "Compite en grupo"}
            tone="gold"
          />
          <StatTile label="Sitio favorito" value={<span className="text-lg">{stats.favoriteRestaurant ?? "—"}</span>} />
        </div>
      </section>

      <Button variant="danger" block onClick={() => void signOut()}>
        <LogOut className="size-4" /> Cerrar sesión
      </Button>

      <Credits />
    </div>
  )
}
