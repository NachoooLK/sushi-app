"use client"

import { CircleAlert, Lock, Mail, Trophy, Users, Zap } from "lucide-react"
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
import { useToast } from "./toast"
import { Button, Field, Logo, Seg } from "./ui"

type Mode = "login" | "register" | "guest"

const PERKS = [
  { icon: Zap, label: "Contador en tiempo real" },
  { icon: Users, label: "Mesas de hasta 10" },
  { icon: Trophy, label: "Rankings y récords" },
]

const CTA: Record<Mode, string> = {
  login: "Entrar",
  register: "Crear cuenta",
  guest: "Entrar como invitado",
}

export function LoginScreen({ inviteCode }: { inviteCode?: string }) {
  const { refresh } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState<"google" | "form" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const locked = busy !== null

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
    if (locked) return
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

  const nameField = (
    <Field
      label="Tu nombre"
      autoComplete="nickname"
      maxLength={40}
      value={name}
      disabled={locked}
      onChange={(event) => setName(event.target.value)}
      placeholder="Como te conocen en la mesa"
    />
  )

  return (
    <main className="flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full flex-1 flex-col px-6 pt-7 md:max-w-[468px] md:pt-16">
        <div className="flex items-center gap-3.5">
          <Logo size={48} />
          <h1 className="text-[36px] leading-10 font-semibold tracking-[-0.03em] text-ink">Sushi Rush</h1>
        </div>
        <p className="mt-4 max-w-[330px] text-[17px] leading-[25px] text-pretty text-ink-2">
          Cuenta cada pieza del libre con tus amigos y descubre quién manda en la mesa.
        </p>

        {inviteCode ? (
          <div className="mt-5 flex items-start gap-3.5 rounded-2xl border border-accent bg-accent-soft p-4">
            <Users size={24} className="mt-px shrink-0 text-accent-ink" aria-hidden />
            <p className="text-[17px] leading-6 font-semibold text-pretty text-ink">
              Te han invitado a la mesa <span className="whitespace-nowrap">{formatCode(inviteCode)}</span>. Entra para
              unirte.
            </p>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col">
            {PERKS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex h-11 items-center gap-3.5 border-t border-line text-[15px] leading-5 font-medium text-ink"
              >
                <Icon size={20} className="shrink-0 text-ink-2" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        )}

        <Button
          kind="secondary"
          size="lg"
          full
          className="mt-6"
          loading={busy === "google"}
          disabled={locked}
          onClick={() => run("google", signInWithGoogle)}
        >
          {busy === "google" ? null : <GoogleMark />}
          Continuar con Google
        </Button>

        <div className="my-[18px] flex items-center gap-3.5 text-[14px] leading-none font-medium text-ink-3">
          <span className="h-px flex-1 bg-line" aria-hidden />o<span className="h-px flex-1 bg-line" aria-hidden />
        </div>

        <Seg
          label="Tipo de acceso"
          value={mode}
          disabled={locked}
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

        <form onSubmit={submit} className="mt-5 flex flex-col gap-4" noValidate>
          {mode === "register" || mode === "guest" ? nameField : null}
          {mode !== "guest" ? (
            <>
              <Field
                label="Email"
                icon={Mail}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                disabled={locked}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
              />
              <Field
                label="Contraseña"
                icon={Lock}
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                disabled={locked}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                help={mode === "register" ? "Mínimo 6 caracteres." : undefined}
              />
            </>
          ) : (
            <p className="text-[14px] leading-5 text-pretty text-ink-2">
              Sin cuenta ni contraseña. Tus resultados se guardan en este dispositivo y cuentan en los rankings.
            </p>
          )}

          {error ? (
            <p role="alert" className="flex items-start gap-2 text-[14px] leading-5 font-medium text-danger">
              <CircleAlert size={18} className="mt-px shrink-0" aria-hidden />
              <span>{error}</span>
            </p>
          ) : null}

          <Button type="submit" size="lg" full loading={busy === "form"} disabled={locked}>
            {CTA[mode]}
          </Button>

          {mode === "login" ? (
            <button
              type="button"
              onClick={forgotPassword}
              disabled={locked}
              className="mx-auto flex h-11 items-center justify-center rounded-input px-2 text-[15px] leading-none font-medium text-ink-2 underline underline-offset-[3px] hover:text-ink disabled:text-ink-3"
            >
              ¿Has olvidado la contraseña?
            </button>
          ) : null}
        </form>
      </div>

      <p className="p-6 pb-[max(24px,env(safe-area-inset-bottom))] text-center text-caption text-ink-3">
        Hecho por{" "}
        <a
          href="https://github.com/NachoooLK"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-2 underline underline-offset-2 hover:text-ink"
        >
          NachoLK
        </a>
      </p>
    </main>
  )
}

/** "G" oficial de Google (asset de marca, multicolor). */
function GoogleMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 18 18" className="shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}
