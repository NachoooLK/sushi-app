"use client"

import { Check, Copy, Share2 } from "lucide-react"
import { useMemo, useState } from "react"
import { encode } from "uqr"
import { formatCode } from "@/lib/code"
import { sessionUrl } from "@/lib/sessions"
import { useToast } from "../toast"
import { Button, Dialog } from "../ui"

export function InviteDialog({
  open,
  onClose,
  code,
  sessionName,
}: {
  open: boolean
  onClose: () => void
  code: string
  sessionName: string
}) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const url = open ? sessionUrl(code) : ""
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast("No se ha podido copiar. Comparte el código a mano.", "error")
    }
  }

  async function share() {
    try {
      await navigator.share({
        title: `Sushi Rush · ${sessionName}`,
        text: `Únete a mi mesa de sushi «${sessionName}» (código ${formatCode(code)})`,
        url,
      })
    } catch {
      // Compartir cancelado: no hace falta avisar.
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Invita a la mesa">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-3xl bg-white p-3 shadow-card">
          {url ? <QrCode value={url} className="size-52" /> : null}
        </div>
        <p className="mt-4 text-sm text-muted">Que escaneen el QR o escriban el código en Inicio</p>
        <p
          className="mt-1 font-display text-4xl font-extrabold tracking-[0.18em] tabular"
          aria-label={`Código ${code.split("").join(" ")}`}
        >
          {formatCode(code)}
        </p>
        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          <Button variant="secondary" onClick={copy}>
            {copied ? <Check className="size-4 text-wasabi" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar enlace"}
          </Button>
          {canShare ? (
            <Button onClick={share}>
              <Share2 className="size-4" /> Compartir
            </Button>
          ) : (
            <Button onClick={onClose}>Listo</Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}

function QrCode({ value, className }: { value: string; className?: string }) {
  const { size, path } = useMemo(() => {
    const qr = encode(value, { ecc: "M", border: 1 })
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
      <rect width={size} height={size} fill="#ffffff" />
      <path d={path} fill="#1f1a17" />
    </svg>
  )
}
