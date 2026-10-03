"use client"

import { ChevronLeft, CircleAlert, MapPin, Utensils } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, type FormEvent } from "react"
import { AuthGate } from "@/components/app-shell"
import { Button, Field, FullScreenLoader, Seg } from "@/components/ui"
import { useAuth } from "@/lib/auth"
import { tableHref } from "@/lib/routes"
import { createSession } from "@/lib/sessions"

type Company = "friends" | "solo"

const HELP: Record<Company, string> = {
  friends: "Al crearla te enseñamos el código y el QR para que se unan (hasta 10).",
  solo: "Cuenta tus piezas y bate tu récord. Si al final se anima alguien, también puede unirse.",
}

const CTA: Record<Company, string> = {
  friends: "Crear mesa e invitar",
  solo: "Empezar a contar",
}

export default function NewTablePage() {
  return (
    <AuthGate>
      <Suspense fallback={<FullScreenLoader />}>
        <NewTable />
      </Suspense>
    </AuthGate>
  )
}

function NewTable() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const [company, setCompany] = useState<Company>("friends")
  const [restaurant, setRestaurant] = useState(() => (params.get("restaurante") ?? "").slice(0, 80))
  const [location, setLocation] = useState(() => (params.get("zona") ?? "").slice(0, 80))
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const withFriends = company === "friends"
  const placeholder = restaurant.trim()
    ? `Libre en ${restaurant.trim()}`
    : withFriends
      ? "Mesa de sushi"
      : "Reto en solitario"

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!user || busy) return
    setBusy(true)
    setFailed(false)
    try {
      const code = await createSession(user, { name: name.trim() || placeholder, restaurant, location })
      // Con amigos, la mesa abre sola la hoja "Invita a la mesa".
      router.replace(tableHref(code) + (withFriends ? "?invitar=1" : ""))
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]">
      <form
        onSubmit={submit}
        noValidate
        className="mx-auto flex w-full flex-1 flex-col md:max-w-[528px] md:flex-none md:pt-6 md:pb-16"
      >
        <nav className="flex h-12 items-center pr-5 pl-3">
          <Link
            href="/"
            className="-ml-1 flex h-11 items-center gap-0.5 rounded-input pr-2 pl-1 text-base leading-none font-medium text-ink-2 hover:text-ink"
          >
            <ChevronLeft size={22} aria-hidden />
            Inicio
          </Link>
        </nav>

        <div className="flex-1 px-6 pt-2">
          <h1 className="text-title text-ink">Nueva mesa</h1>
          <p className="mt-1.5 text-body text-pretty text-ink-2">
            Sólo el nombre es obligatorio, y hasta ese tiene uno por defecto.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <p className="text-[14px] leading-5 font-semibold text-ink">
              ¿Con quién?
            </p>
            <Seg
              label="¿Con quién?"
              value={company}
              disabled={busy}
              onChange={setCompany}
              options={[
                { value: "friends", label: "Con amigos" },
                { value: "solo", label: "Yo solo" },
              ]}
            />
            <p className="text-[14px] leading-5 text-pretty text-ink-2" aria-live="polite">
              {HELP[company]}
            </p>
          </div>

          <div className="mt-[22px] flex flex-col gap-4">
            <Field
              label="Restaurante"
              icon={Utensils}
              placeholder="Sakura Buffet"
              maxLength={80}
              autoComplete="off"
              value={restaurant}
              disabled={busy}
              onChange={(event) => setRestaurant(event.target.value)}
            />
            <Field
              label="Zona o ciudad"
              icon={MapPin}
              placeholder="Chamberí, Madrid"
              maxLength={80}
              autoComplete="off"
              value={location}
              disabled={busy}
              onChange={(event) => setLocation(event.target.value)}
            />
            <Field
              label="Nombre de la mesa"
              placeholder={placeholder}
              maxLength={60}
              autoComplete="off"
              value={name}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </div>

        {/* Móvil: fijo abajo con la zona segura. Desde 768: al final del formulario. */}
        <div className="sticky bottom-0 flex flex-col gap-3 bg-bg px-6 pt-3 pb-[max(34px,env(safe-area-inset-bottom))] md:static md:mt-8 md:pb-0">
          {failed ? (
            <p role="alert" className="flex items-start gap-2 text-[14px] leading-5 font-medium text-danger">
              <CircleAlert size={18} className="mt-px shrink-0" aria-hidden />
              <span>No se ha podido crear la mesa. Revisa tu conexión e inténtalo otra vez.</span>
            </p>
          ) : null}
          <Button type="submit" size="lg" full loading={busy}>
            {CTA[company]}
          </Button>
        </div>
      </form>
    </main>
  )
}
