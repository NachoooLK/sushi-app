"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

/** Cabecera de las pantallas de mesa: sin navegación global, con vuelta al inicio. */
export function MesaHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 bg-bg pt-[env(safe-area-inset-top)] lg:border-b lg:border-line">
      <div className="flex h-14 items-center gap-0.5 pr-2 pl-1.5 lg:h-[72px] lg:gap-2 lg:px-8">
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-sf"
        >
          <ChevronLeft size={26} aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] leading-[22px] font-semibold text-ink lg:text-h3">{title}</h1>
          {subtitle ? <p className="truncate text-caption text-ink-2 lg:text-body">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-1 lg:gap-3">{actions}</div> : null}
      </div>
    </header>
  )
}

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-sf hover:text-ink"
    >
      {children}
    </button>
  )
}

export function whereLine(session: { restaurant: string | null; location: string | null }) {
  return [session.restaurant, session.location].filter(Boolean).join(" · ")
}
