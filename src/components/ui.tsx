"use client"

import { X } from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg"

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong shadow-card",
  secondary: "bg-surface text-ink border border-line hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2",
  danger: "bg-surface text-danger border border-line hover:border-danger/60",
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-4 text-[15px] gap-2 rounded-2xl",
  lg: "h-14 px-6 text-base gap-2.5 rounded-2xl",
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  block?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        buttonVariants[variant],
        buttonSizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : null}
      {children}
    </button>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx("inline-block animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  )
}

export function FullScreenLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center" role="status">
      <div className="flex flex-col items-center gap-4 text-muted">
        <Logo className="size-14 animate-pulse" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("rounded-3xl border border-line bg-surface shadow-card", className)}>{children}</div>
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  )
}

export function Field({
  label,
  hint,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string | null }) {
  const id = useId()
  return (
    <label htmlFor={id} className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        id={id}
        className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-ink placeholder:text-muted/70 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? (
        <span className="mt-1.5 block text-sm text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  )
}

const AVATAR_TONES = [
  "bg-[#f9d5c8] text-[#8a2f15]",
  "bg-[#d8ecc4] text-[#335d12]",
  "bg-[#f6e3b0] text-[#7a5600]",
  "bg-[#d6e2f5] text-[#24467a]",
  "bg-[#ecd6ef] text-[#6b2a73]",
  "bg-[#d3eee8] text-[#145e52]",
]

export function Avatar({
  name,
  photoURL,
  seed,
  size = 40,
  className,
}: {
  name: string
  photoURL?: string | null
  seed?: string
  size?: number
  className?: string
}) {
  const key = seed ?? name
  let hash = 0
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  return (
    <span
      className={cx(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold",
        AVATAR_TONES[hash % AVATAR_TONES.length],
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden
    >
      {initials || "?"}
      {photoURL ? (
        <img
          src={photoURL}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
          onError={(event) => event.currentTarget.remove()}
        />
      ) : null}
    </span>
  )
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: "default" | "accent" | "gold" | "wasabi"
}) {
  const tones = {
    default: "bg-surface",
    accent: "bg-accent-soft",
    gold: "bg-gold-soft",
    wasabi: "bg-wasabi-soft",
  }
  return (
    <div className={cx("rounded-2xl border border-line p-4", tones[tone])}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tracking-tight tabular">{value}</div>
      {hint ? <div className="mt-0.5 truncate text-xs text-muted">{hint}</div> : null}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-10 text-center">
      {icon ? <div className="mb-3 text-muted">{icon}</div> : null}
      <p className="font-display text-lg font-bold">{title}</p>
      {children ? <p className="mt-1 max-w-xs text-sm text-muted">{children}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-2xl bg-surface-2 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={cx(
            "h-9 flex-1 rounded-xl text-sm font-semibold transition",
            option.value === value ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Modal sobre <dialog> nativo: foco atrapado, Escape y fondo gratis. */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className="m-auto mb-0 w-full max-w-md rounded-t-3xl border border-line bg-surface p-0 text-ink shadow-card backdrop:animate-fade-in open:animate-slide-up sm:mb-auto sm:rounded-3xl"
    >
      {open ? (
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id={titleId} className="font-display text-xl font-bold tracking-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <ellipse cx="32" cy="44" rx="25" ry="11" fill="#fffaf2" stroke="#e6dccd" strokeWidth="2" />
      <path d="M9 36c0-10 10.5-17 23-17s23 7 23 17c0 4-5 6-23 6S9 40 9 36Z" fill="#ff7a52" />
      <path
        d="M17 26c3 3 3.5 8 2 12M27 21.5c3.5 3.5 4 10 2 16M38 21.5c3 3.5 3.5 10 1.5 16M48 26c2.5 3 3 8 1.5 12"
        stroke="#ffd9c9"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="26" y="18" width="12" height="30" rx="3" fill="#24302a" />
    </svg>
  )
}
