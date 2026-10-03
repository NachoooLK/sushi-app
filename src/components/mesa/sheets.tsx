"use client"

import { Check, Link as LinkIcon, Share } from "lucide-react"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { encode } from "uqr"
import { formatCode } from "@/lib/code"
import { pieces } from "@/lib/format"
import { sessionUrl, updateSessionDetails } from "@/lib/sessions"
import type { Session } from "@/lib/types"
import { RankList, type RankEntry } from "../rank-list"
import { Sheet } from "../sheet"
import { useToast } from "../toast"
import { Button, Field } from "../ui"

export function InviteSheet({ open, onClose, session }: { open: boolean; onClose: () => void; session: Session }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const url = open ? sessionUrl(session.code) : ""
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast("No se ha podido copiar el enlace.", "error")
    }
  }

  async function share() {
    try {
      await navigator.share({
        title: `Sushi Rush · ${session.name}`,
        text: `Únete a mi mesa «${session.name}» (código ${formatCode(session.code)})`,
        url,
      })
    } catch {
      // Compartir cancelado.
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Invita a la mesa">
      <div className="flex flex-col items-center gap-3.5 pt-1.5">
        <div className="rounded-[20px] border border-line bg-white p-3.5">
          {url ? <QrCode value={url} className="size-[196px] md:size-[212px]" /> : null}
        </div>
        <p className="max-w-[290px] text-center text-body text-balance text-ink-2">
          Que escaneen el QR o escriban el código en Inicio
        </p>
        <p
          className="pl-[0.08em] text-[46px] leading-[52px] font-semibold tracking-[0.08em] text-ink tabular-nums"
          aria-label={`Código ${session.code.split("").join(" ")}`}
        >
          {formatCode(session.code)}
        </p>
        <div className="mt-1 flex w-full gap-3">
          <Button kind="secondary" full className="flex-1" icon={copied ? Check : LinkIcon} onClick={copy}>
            {copied ? "Copiado" : "Copiar enlace"}
          </Button>
          {canShare ? (
            <Button full className="flex-1" icon={Share} onClick={share}>
              Compartir
            </Button>
          ) : (
            <Button full className="flex-1" icon={Check} onClick={onClose}>
              Listo
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  )
}

function QrCode({ value, className }: { value: string; className?: string }) {
  const { size, path } = useMemo(() => {
    const qr = encode(value, { ecc: "M", border: 0 })
    let d = ""
    qr.data.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) d += `M${x} ${y}h1v1h-1z`
      }),
    )
    return { size: qr.size, path: d }
  }, [value])

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} shapeRendering="crispEdges" role="img" aria-label="Código QR de la mesa">
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#111" />
    </svg>
  )
}

export function CloseSheet({
  open,
  onClose,
  onConfirm,
  busy,
  entries,
  meId,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  busy: boolean
  entries: RankEntry[]
  meId: string
}) {
  return (
    <Sheet open={open} onClose={onClose} title="¿Cerrar la mesa?">
      <div className="flex flex-col gap-1.5 pt-0.5 text-body text-pretty text-ink-2">
        <p>Se guardará el resultado y nadie podrá sumar más piezas.</p>
        {entries.length < 2 ? <p>Al comer solo, cuenta para tus récords pero no como victoria.</p> : null}
      </div>
      <div className="mt-2.5 mb-[18px] px-3">
        <RankList entries={entries.slice(0, 5)} meId={meId} dense />
      </div>
      <div className="flex gap-3">
        <Button kind="secondary" full className="flex-1" onClick={onClose} disabled={busy}>
          Seguir comiendo
        </Button>
        <Button full className="flex-1" onClick={onConfirm} loading={busy}>
          Cerrar mesa
        </Button>
      </div>
    </Sheet>
  )
}

export function LeaveSheet({
  open,
  onClose,
  onConfirm,
  busy,
  count,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  busy: boolean
  count: number
}) {
  return (
    <Sheet open={open} onClose={onClose} title="¿Salir de la mesa?">
      <p className="pt-0.5 pb-6 text-base leading-6 text-pretty text-ink-2">
        Tus {pieces(count)} de esta mesa se perderán y no contarán en el resultado.
      </p>
      <div className="flex gap-3">
        <Button kind="secondary" full className="flex-1" onClick={onClose} disabled={busy}>
          Quedarme
        </Button>
        <Button kind="dangerSolid" full className="flex-1" onClick={onConfirm} loading={busy}>
          Salir
        </Button>
      </div>
    </Sheet>
  )
}

export function EditSheet({ open, onClose, session }: { open: boolean; onClose: () => void; session: Session }) {
  return (
    <Sheet open={open} onClose={onClose} title="Editar mesa">
      {/* Se monta al abrir para partir siempre de los datos actuales de la mesa. */}
      {open ? <EditForm session={session} onDone={onClose} /> : null}
    </Sheet>
  )
}

function EditForm({ session, onDone }: { session: Session; onDone: () => void }) {
  const toast = useToast()
  const [name, setName] = useState(session.name)
  const [restaurant, setRestaurant] = useState(session.restaurant ?? "")
  const [location, setLocation] = useState(session.location ?? "")
  const [busy, setBusy] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // El diálogo enfoca su título al abrirse; aquí lo natural es empezar escribiendo el nombre.
  useEffect(() => {
    const frame = requestAnimationFrame(() => formRef.current?.querySelector("input")?.focus())
    return () => cancelAnimationFrame(frame)
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await updateSessionDetails(session.code, { name, restaurant, location })
      onDone()
    } catch {
      toast("No se han podido guardar los cambios.", "error")
      setBusy(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={submit}>
      <div className="flex flex-col gap-4 pt-1.5 pb-[22px]">
        <Field label="Nombre de la mesa" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} disabled={busy} />
        <Field label="Restaurante" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} maxLength={80} disabled={busy} />
        <Field label="Zona o ciudad" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} disabled={busy} />
      </div>
      <Button type="submit" size="lg" full loading={busy}>
        Guardar
      </Button>
    </form>
  )
}
