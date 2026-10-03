"use client"

import { Trophy, Users, Zap } from "lucide-react"
import { useState, type FormEvent } from "react"
import {
  authErrorMessage,
  guestLoginEnabled,
  registerWithEmail,
  resetPassword,
  signInAsGuest,
  signInWithEmail,
  signInWithGoogle,
  useAuth,
} from "@/lib/auth"
import { formatCode } from "@/lib/code"
import { Credits } from "./credits"
import { useToast } from "./toast"
import { Button, Card, Field, Logo, Segmented } from "./ui"

type Mode = "login" | "register" | "guest"

export function LoginScreen({ inviteCode }: { inviteCode?: string }) {
  const { refresh } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState<"google" | "form" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(kind: "google" | "form", action: () => Promise<void>) {
    setBusy(kind)
    setError(null)
    try {
      await action()
      refresh()
    } catch (caught) {
      setError(authErrorMessage(caught))
    } finally {
      setBusy(null)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (mode === "register") {
      if (!name.trim()) return setError("¿Cómo te llamas? Es lo que verán en el ranking.")
      return run("form", () => registerWithEmail(name, email, password))
    }
    if (mode === "guest") {
      if (!name.trim()) return setError("Escribe tu nombre para la mesa.")
      return run("form", () => signInAsGuest(name))
    }
    return run("form", () => signInWithEmail(email, password))
  }

  async function forgotPassword() {
    if (!email.trim()) return setError("Escribe tu email y te mandamos un enlace para cambiarla.")
    try {
      await resetPassword(email)
      setError(null)
      toast("Te hemos enviado un email para cambiar la contraseña.", "success")
    } catch (caught) {
      setError(authErrorMessage(caught))
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <header className="flex flex-col items-center text-center">
        <Logo className="size-20 drop-shadow-sm" />
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Sushi Rush</h1>
        <p className="mt-2 max-w-xs text-balance text-muted">
          Cuenta cada pieza del libre con tus amigos y descubre quién manda en la mesa.
        </p>
      </header>

      {inviteCode ? (
        <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-center text-sm">
          Te han invitado a la mesa <strong className="tabular tracking-wider">{formatCode(inviteCode)}</strong>.
          Entra para unirte.
        </div>
      ) : (
        <ul className="mt-7 grid grid-cols-3 gap-2 text-center text-xs text-muted">
          <li className="flex flex-col items-center gap-1.5">
            <Zap className="size-5 text-accent" />
            Contador en tiempo real
          </li>
          <li className="flex flex-col items-center gap-1.5">
            <Users className="size-5 text-accent" />
            Mesas de hasta 10
          </li>
          <li className="flex flex-col items-center gap-1.5">
            <Trophy className="size-5 text-accent" />
            Rankings y récords
          </li>
        </ul>
      )}

      <Card className="mt-6 p-5">
        <Button
          variant="secondary"
          size="lg"
          block
          loading={busy === "google"}
          disabled={busy !== null}
          onClick={() => run("google", signInWithGoogle)}
        >
          {busy === "google" ? null : <GoogleMark />}
          Continuar con Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
        </div>

        <Segmented
          label="Tipo de acceso"
          value={mode}
          onChange={(next) => {
            setMode(next)
            setError(null)
          }}
          options={[
            { value: "login", label: "Entrar" },
            { value: "register", label: "Crear cuenta" },
            ...(guestLoginEnabled ? [{ value: "guest" as const, label: "Invitado" }] : []),
          ]}
        />

        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          {mode !== "login" ? (
            <Field
              label="Tu nombre"
              autoComplete="nickname"
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Como te conocen en la mesa"
            />
          ) : null}
          {mode !== "guest" ? (
            <>
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
              />
              <Field
                label="Contraseña"
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                hint={mode === "register" ? "Mínimo 6 caracteres." : undefined}
              />
            </>
          ) : (
            <p className="text-xs text-muted">
              Sin cuenta ni contraseña. Tus resultados se guardan en este dispositivo y cuentan en los rankings.
            </p>
          )}

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" block loading={busy === "form"} disabled={busy !== null}>
            {mode === "register" ? "Crear cuenta" : mode === "guest" ? "Entrar como invitado" : "Entrar"}
          </Button>

          {mode === "login" ? (
            <button
              type="button"
              onClick={forgotPassword}
              className="mx-auto block text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              ¿Has olvidado la contraseña?
            </button>
          ) : null}
        </form>
      </Card>

      <div className="mt-auto pt-8">
        <Credits />
      </div>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}
