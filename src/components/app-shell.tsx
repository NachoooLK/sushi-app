"use client"

import { History, House, Trophy, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
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
  { href: "/perfil", label: "Perfil", icon: User },
]

/** Ancho máximo del contenido en escritorio: listas más estrechas que las pantallas a dos columnas. */
type Width = "wide" | "rankings" | "list"

const WIDTHS: Record<Width, string> = {
  wide: "md:max-w-[640px] lg:max-w-[1040px]",
  rankings: "md:max-w-[640px] lg:max-w-[1000px]",
  list: "md:max-w-[640px] lg:max-w-[720px]",
}

export function AppShell({ children, width = "wide" }: { children: ReactNode; width?: Width }) {
  return (
    <AuthGate>
      <ShellFrame width={width}>{children}</ShellFrame>
    </AuthGate>
  )
}

function ShellFrame({ children, width }: { children: ReactNode; width: Width }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const scrolled = useScrolled()
  if (!user) return null
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))
  const avatar = <Avatar name={displayNameOf(user)} photoURL={user.photoURL} seed={user.uid} size={36} />

  return (
    <div className="min-h-dvh">
      <header
        className={cx(
          "sticky top-0 z-30 border-b bg-bg pt-[env(safe-area-inset-top)] transition-colors",
          scrolled ? "border-line" : "border-transparent md:border-line",
        )}
      >
        <div className="mx-auto flex h-14 items-center gap-2.5 px-5 md:h-16 md:max-w-none md:px-10">
          <Link href="/" className="flex items-center gap-2.5 rounded-btn md:mr-7">
            <Logo size={28} className="md:size-[30px]" />
            <span className="text-h3 text-ink md:text-[19px]">Sushi Rush</span>
          </Link>
          <nav aria-label="Secciones" className="hidden flex-1 md:flex">
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "relative flex h-16 items-center gap-2 px-3.5 text-[15px] leading-none",
                    active ? "font-semibold text-ink" : "font-medium text-ink-2 hover:text-ink",
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.1 : 1.75} aria-hidden />
                  {label}
                  {active ? <span className="absolute inset-x-3.5 bottom-0 h-0.5 bg-accent" aria-hidden /> : null}
                </Link>
              )
            })}
          </nav>
          <span className="flex-1 md:hidden" />
          <Link href="/perfil" aria-label="Tu perfil" className="-mr-1 flex size-11 items-center justify-center rounded-full">
            {avatar}
          </Link>
        </div>
      </header>

      <main
        className={cx(
          "mx-auto w-full px-5 pt-3 pb-[calc(56px+env(safe-area-inset-bottom)+32px)] md:px-10 md:pt-10 md:pb-[72px]",
          WIDTHS[width],
          "md:box-content",
        )}
      >
        {children}
      </main>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="flex h-14">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "relative flex h-full min-h-11 flex-col items-center justify-center gap-[3px] text-[12px] leading-4",
                    active ? "font-semibold text-ink" : "font-medium text-ink-3",
                  )}
                >
                  <span className={cx("absolute top-0 h-0.5 w-5 rounded-[1px]", active ? "bg-accent" : "bg-transparent")} aria-hidden />
                  <Icon size={24} strokeWidth={active ? 2.1 : 1.75} aria-hidden />
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

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return scrolled
}
