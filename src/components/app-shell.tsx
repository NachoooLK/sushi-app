"use client"

import { History, House, Trophy, UserRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { displayNameOf, useAuth } from "@/lib/auth"
import { LoginScreen } from "./login-screen"
import { Avatar, cx, FullScreenLoader, Logo } from "./ui"

/** Muestra el login en la misma URL, así al entrar sigues donde ibas (p. ej. un enlace de invitación). */
export function AuthGate({ children, inviteCode }: { children: ReactNode; inviteCode?: string }) {
  const { user, ready } = useAuth()
  if (!ready) return <FullScreenLoader />
  if (!user) return <LoginScreen inviteCode={inviteCode} />
  return children
}

const TABS = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/perfil", label: "Perfil", icon: UserRound },
]

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <AuthGate>
      <ShellFrame title={title}>{children}</ShellFrame>
    </AuthGate>
  )
}

function ShellFrame({ children, title }: { children: ReactNode; title?: string }) {
  const { user } = useAuth()
  const pathname = usePathname()
  if (!user) return null

  return (
    <div className="mx-auto min-h-dvh max-w-2xl">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-bg/85 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="font-display text-lg font-extrabold tracking-tight">{title ?? "Sushi Rush"}</span>
        </Link>
        <Link href="/perfil" aria-label="Tu perfil" className="rounded-full ring-accent/40 hover:ring-4">
          <Avatar name={displayNameOf(user)} photoURL={user.photoURL} seed={user.uid} size={36} />
        </Link>
      </header>

      <main className="px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">{children}</main>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        <ul className="mx-auto grid max-w-2xl grid-cols-4">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition",
                    active ? "text-accent" : "text-muted hover:text-ink",
                  )}
                >
                  <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
