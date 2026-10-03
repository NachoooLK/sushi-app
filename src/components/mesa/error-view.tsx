"use client"

import { ChevronLeft, Search, WifiOff } from "lucide-react"
import Link from "next/link"
import { Button, ButtonLink } from "../ui"

export function ErrorView({ kind, code, onRetry }: { kind: "not-found" | "load"; code: string; onRetry?: () => void }) {
  const notFound = kind === "not-found"
  const Icon = notFound ? Search : WifiOff
  return (
    <main className="flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex h-12 items-center pl-1.5">
        <Link href="/" aria-label="Volver al inicio" className="flex size-11 items-center justify-center rounded-full text-ink hover:bg-sf">
          <ChevronLeft size={26} aria-hidden />
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-8 pb-[60px] text-center">
        <span className="mb-1.5 flex size-[72px] items-center justify-center rounded-full border border-line-strong text-ink-2">
          <Icon size={32} aria-hidden />
        </span>
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.025em] text-balance text-ink">
          {notFound ? `No encontramos la mesa ${code}` : "No se ha podido cargar la mesa."}
        </h1>
        <p className="text-body-lg font-medium text-ink">{notFound ? "Ese código no es válido" : "Revisa tu conexión."}</p>
        {notFound ? (
          <p className="max-w-[300px] text-body text-pretty text-ink-2">
            Revisa el código con quien te lo pasó: son 6 caracteres, sin la letra O ni el número 0.
          </p>
        ) : null}
      </div>
      <div className="mx-auto flex w-full flex-col gap-2 px-6 pb-[max(44px,calc(env(safe-area-inset-bottom)+10px))] md:max-w-[420px]">
        {notFound ? (
          <ButtonLink href="/" size="lg" full>
            Ir al inicio
          </ButtonLink>
        ) : (
          <>
            <Button size="lg" full onClick={onRetry}>
              Reintentar
            </Button>
            <ButtonLink href="/" kind="ghost" size="lg" full>
              Ir al inicio
            </ButtonLink>
          </>
        )}
      </div>
    </main>
  )
}
