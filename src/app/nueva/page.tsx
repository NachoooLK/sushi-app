"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, type FormEvent } from "react"
import { AuthGate } from "@/components/app-shell"
import { Button, Field, Segmented } from "@/components/ui"
import { useAuth } from "@/lib/auth"
import { createSession } from "@/lib/sessions"

export default function NewSessionPage() {
  return (
    <AuthGate>
      <Suspense>
        <NewSession />
      </Suspense>
    </AuthGate>
  )
}

function NewSession() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [company, setCompany] = useState<"group" | "solo">("group")
  const [name, setName] = useState("")
  const [restaurant, setRestaurant] = useState(params.get("restaurante") ?? "")
  const [location, setLocation] = useState(params.get("zona") ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null
  const fallbackName = restaurant.trim() ? `Libre en ${restaurant.trim()}` : company === "solo" ? "Reto en solitario" : "Mesa de sushi"

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setBusy(true)
    setError(null)
    try {
      const code = await createSession(user, { name: name || fallbackName, restaurant, location })
      router.replace(company === "group" ? `/s/${code}?invitar=1` : `/s/${code}`)
    } catch {
      setError("No se ha podido crear la mesa. Revisa tu conexión e inténtalo otra vez.")
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <Link
        href="/"
        className="-ml-2 inline-flex h-10 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Inicio
      </Link>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Nueva mesa</h1>
      <p className="mt-1 text-muted">Sólo el nombre es obligatorio, y hasta ese tiene uno por defecto.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <span className="mb-1.5 block text-sm font-medium">¿Con quién?</span>
          <Segmented
            label="¿Con quién comes?"
            value={company}
            onChange={setCompany}
            options={[
              { value: "group", label: "Con amigos" },
              { value: "solo", label: "Yo solo" },
            ]}
          />
          <p className="mt-1.5 text-xs text-muted">
            {company === "group"
              ? "Al crearla te enseñamos el código y el QR para que se unan (hasta 10)."
              : "Cuenta tus piezas y bate tu récord. Si al final se anima alguien, también puede unirse."}
          </p>
        </div>
        <Field
          label="Restaurante"
          value={restaurant}
          onChange={(event) => setRestaurant(event.target.value)}
          placeholder="Sakura Buffet"
          maxLength={80}
          autoComplete="off"
        />
        <Field
          label="Zona o ciudad"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Chamberí, Madrid"
          maxLength={80}
          autoComplete="off"
        />
        <Field
          label="Nombre de la mesa"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={fallbackName}
          maxLength={60}
          autoComplete="off"
        />
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" block loading={busy}>
          {company === "group" ? "Crear mesa e invitar" : "Empezar a contar"}
        </Button>
      </form>
    </main>
  )
}
