"use client"

import { Check, LogOut, Pencil } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { AppShell } from "@/components/app-shell"
import { Credits } from "@/components/credits"
import { useMySessions } from "@/components/providers"
import { useToast } from "@/components/toast"
import { Avatar, Button, Field, Stat, StatGrid } from "@/components/ui"
import { displayNameOf, signOut, updateDisplayName, useAuth } from "@/lib/auth"
import { decimal } from "@/lib/format"
import { personalStats } from "@/lib/stats"

export default function ProfilePage() {
  return (
    <AppShell width="list">
      <Profile />
    </AppShell>
  )
}

function Profile() {
  const { user, refresh } = useAuth()
  const { sessions, loading } = useMySessions()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const editButton = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)

  // Al terminar de editar, el foco vuelve al lápiz.
  useEffect(() => {
    if (wasEditing.current && !editing) editButton.current?.focus()
    wasEditing.current = editing
  }, [editing])

  if (!user) return null

  const displayName = displayNameOf(user)
  const stats = personalStats(sessions, user.uid)
  const pending = loading && sessions.length === 0
  const value = (content: string | number) => (pending ? <ValueBone /> : content)

  function startEditing() {
    setName(displayName)
    setEditing(true)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    const next = name.trim()
    if (!user || !next || saving) return
    if (next === displayName) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await updateDisplayName(user, next)
      refresh()
      setEditing(false)
      toast("Nombre actualizado. Se usará en tus próximas mesas.", "success")
    } catch {
      toast("No se ha podido cambiar el nombre.", "error")
    } finally {
      setSaving(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Escape" && !saving) setEditing(false)
  }

  async function leave() {
    setLeaving(true)
    try {
      await signOut()
    } catch {
      setLeaving(false)
    }
  }

  return (
    <div className="flex flex-col pt-2 md:pt-0">
      <Avatar name={displayName} photoURL={user.photoURL} seed={user.uid} size={88} />

      {editing ? (
        <form onSubmit={save} onKeyDown={onKeyDown} className="mt-4 flex flex-col gap-3">
          <Field
            label="Tu nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            autoFocus
            autoComplete="name"
            disabled={saving}
          />
          <div className="flex gap-2.5">
            <Button type="submit" kind="primary" icon={Check} full loading={saving} disabled={!name.trim()} className="flex-1">
              Guardar
            </Button>
            <Button kind="secondary" full disabled={saving} onClick={() => setEditing(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex min-w-0 items-center gap-1">
          <h1 className="truncate text-[30px] leading-9 font-semibold tracking-[-0.03em] text-ink">{displayName}</h1>
          <button
            ref={editButton}
            type="button"
            aria-label="Editar nombre"
            onClick={startEditing}
            className="flex size-11 shrink-0 items-center justify-center rounded-input text-ink-2 transition-colors hover:bg-sf hover:text-ink"
          >
            <Pencil size={20} aria-hidden />
          </button>
        </div>
      )}

      <p className="mt-0.5 truncate text-base leading-6 text-ink-2">
        {user.isAnonymous ? "Cuenta de invitado" : user.email}
      </p>

      <h2 className="mt-9 text-h2 text-ink">Tu carrera sushera</h2>
      <StatGrid className="mt-3.5">
        <Stat label="Piezas totales" value={value(stats.pieces.toLocaleString("es-ES"))} />
        <Stat label="Récord" value={value(stats.best)} sub="en una mesa" />
        <Stat label="Mesas" value={value(stats.sessions)} sub={`${stats.groupSessions} en grupo`} />
        <Stat label="Media" value={value(decimal(stats.average))} sub="piezas por mesa" />
        <Stat
          label="Victorias"
          value={value(stats.wins)}
          sub={
            stats.groupSessions
              ? `${Math.round((stats.wins / stats.groupSessions) * 100)}% de las mesas en grupo`
              : "Compite en grupo"
          }
        />
        <Stat label="Sitio favorito" value={value(stats.favoriteRestaurant ?? "—")} small />
      </StatGrid>

      <Button kind="secondary" size="lg" icon={LogOut} full loading={leaving} onClick={leave} className="mt-7">
        Cerrar sesión
      </Button>

      <footer className="mt-10">
        <Credits />
      </footer>
    </div>
  )
}

function ValueBone() {
  return (
    <span aria-hidden className="inline-block h-7 w-14 animate-skeleton rounded-lg bg-sf align-middle" />
  )
}
