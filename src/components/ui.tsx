"use client"

import { CircleAlert, type LucideIcon } from "lucide-react"
import Link from "next/link"
import {
  useId,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react"

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

/* ── Botón ─────────────────────────────────────────────────────────────── */

export type ButtonKind = "primary" | "secondary" | "ghost" | "danger" | "dangerSolid"
export type ButtonSize = "sm" | "md" | "lg"

const KINDS: Record<ButtonKind, string> = {
  primary: "bg-accent text-accent-on border-transparent hover:brightness-108 active:brightness-90",
  secondary: "bg-transparent text-ink border-line-strong hover:bg-sf active:bg-line",
  ghost: "bg-transparent text-ink-2 border-transparent hover:bg-sf active:bg-line",
  danger: "bg-transparent text-danger border-danger hover:bg-sf active:brightness-90",
  dangerSolid: "bg-danger text-danger-on border-transparent hover:brightness-108 active:brightness-90",
}

const SIZES: Record<ButtonSize, string> = {
  sm: "h-11 px-4 rounded-input text-[15px] leading-none",
  md: "h-[52px] px-[22px] rounded-btn text-base leading-none",
  lg: "h-[60px] px-[22px] rounded-btn text-base leading-none",
}

export function buttonClass({
  kind = "primary",
  size = "md",
  full = false,
  className,
}: { kind?: ButtonKind; size?: ButtonSize; full?: boolean; className?: string } = {}) {
  return cx(
    "inline-flex min-w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap border font-semibold select-none",
    "transition-[transform,filter,background-color] duration-[90ms] ease-out active:scale-[0.98]",
    "disabled:pointer-events-none disabled:border-line disabled:bg-sf disabled:text-ink-3 disabled:brightness-100",
    KINDS[kind],
    SIZES[size],
    full && "w-full",
    className,
  )
}

export function Button({
  kind = "primary",
  size = "md",
  full,
  icon: Icon,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: ButtonKind
  size?: ButtonSize
  full?: boolean
  icon?: LucideIcon
  loading?: boolean
}) {
  const iconSize = size === "lg" ? 24 : 20
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ kind, size, full, className })}
      {...props}
    >
      {loading ? <Spinner /> : Icon ? <Icon size={iconSize} aria-hidden /> : null}
      {children}
    </button>
  )
}

export function ButtonLink({
  kind = "primary",
  size = "md",
  full,
  icon: Icon,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { kind?: ButtonKind; size?: ButtonSize; full?: boolean; icon?: LucideIcon }) {
  return (
    <Link className={buttonClass({ kind, size, full, className })} {...props}>
      {Icon ? <Icon size={size === "lg" ? 24 : 20} aria-hidden /> : null}
      {children}
    </Link>
  )
}

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={cx("shrink-0", className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="origin-center animate-spin-fast" />
    </svg>
  )
}

/* ── Campos ────────────────────────────────────────────────────────────── */

const FIELD_BOX =
  "flex h-[52px] min-w-0 items-center gap-2.5 rounded-input border px-4 transition-[box-shadow,border-color] duration-150"

function fieldState(error: boolean, disabled?: boolean) {
  if (disabled) return "border-line bg-sf"
  if (error) return "border-danger shadow-[0_0_0_3px_var(--err-soft)]"
  return "border-line-strong focus-within:border-ink focus-within:shadow-[0_0_0_3px_var(--ac-soft)]"
}

export function FieldMessage({ id, error, help }: { id: string; error?: string | null; help?: string }) {
  if (error) {
    return (
      <p id={id} role="alert" className="flex items-start gap-1.5 text-caption font-medium text-danger">
        <CircleAlert size={16} className="mt-px shrink-0" aria-hidden />
        <span>{error}</span>
      </p>
    )
  }
  return help ? (
    <p id={id} className="text-caption text-ink-3">
      {help}
    </p>
  ) : null
}

export function Field({
  label,
  icon: Icon,
  help,
  error,
  invalid = false,
  code = false,
  className,
  disabled,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  icon?: LucideIcon
  help?: string
  error?: string | null
  /** Pinta el estado de error sin mensaje, cuando el mensaje vive fuera del campo. */
  invalid?: boolean
  code?: boolean
}) {
  const id = useId()
  const messageId = `${id}-msg`
  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="text-label text-ink-2">
          {label}
        </label>
      ) : null}
      <div className={cx(FIELD_BOX, fieldState(Boolean(error) || invalid, disabled))}>
        {Icon ? <Icon size={20} className="shrink-0 text-ink-3" aria-hidden /> : null}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={error || help ? messageId : undefined}
          className={cx(
            "h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3 focus-visible:shadow-none disabled:text-ink-3",
            code
              ? "text-[22px] leading-7 font-semibold tracking-[0.14em] uppercase tabular-nums placeholder:normal-case"
              : "text-[17px] leading-6",
          )}
          {...props}
        />
      </div>
      <FieldMessage id={messageId} error={error} help={help} />
    </div>
  )
}

export function TextArea({
  value,
  maxLength = 280,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string; maxLength?: number }) {
  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <textarea
        value={value}
        maxLength={maxLength}
        className="min-h-24 w-full resize-none rounded-input border border-line-strong bg-transparent px-4 py-3 text-base leading-6 text-ink outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-ink-3 focus:border-ink focus:shadow-[0_0_0_3px_var(--ac-soft)] focus-visible:shadow-[0_0_0_3px_var(--ac-soft)]"
        {...props}
      />
      <p className="text-right text-caption text-ink-3 tabular-nums" aria-live="off">
        {value.length}/{maxLength}
      </p>
    </div>
  )
}

/* ── Selector segmentado ───────────────────────────────────────────────── */

export function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  label: string
  disabled?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full gap-1 rounded-2xl border border-line p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cx(
              "flex h-11 flex-1 items-center justify-center rounded-input text-[15px] leading-none font-semibold whitespace-nowrap transition-colors duration-150",
              active ? "bg-ink text-bg" : "text-ink-2 hover:bg-sf",
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Etiquetas ─────────────────────────────────────────────────────────── */

export type TagKind = "live" | "you" | "host" | "record" | "neutral"

const TAGS: Record<TagKind, string> = {
  live: "text-accent-ink border-accent",
  you: "text-accent-on bg-accent border-transparent",
  host: "text-ink-2 border-line-strong",
  record: "text-ink bg-accent-soft border-accent",
  neutral: "text-ink-2 bg-sf border-transparent",
}

export function Tag({ kind = "neutral", big = false, children }: { kind?: TagKind; big?: boolean; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
        big ? "px-3 py-1 text-[14px] leading-5" : "px-2 py-px text-[12px] leading-[18px]",
        TAGS[kind],
      )}
    >
      {kind === "live" ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {kind === "record" ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.5 2.6a.6.6 0 0 1 1 0l2.8 5.8 6.3.9c.5.1.7.7.3 1l-4.6 4.5 1.1 6.3c.1.5-.4.9-.9.6L12 18.8l-5.6 2.9c-.5.3-1-.1-.9-.6l1.1-6.3L2 10.3c-.4-.3-.2-.9.3-1l6.3-.9 2.9-5.8Z" />
        </svg>
      ) : null}
      {children}
    </span>
  )
}

/* ── Avatar, medalla, logo ─────────────────────────────────────────────── */

const HUES = [25, 75, 120, 165, 205, 255, 305, 345]

function hueFor(seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return HUES[hash % HUES.length]
}

export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "?"
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0][0]).toUpperCase()
}

export function Avatar({
  name,
  photoURL,
  seed,
  size = 40,
  className,
}: {
  name: string
  photoURL?: string | null
  seed: string
  size?: number
  className?: string
}) {
  const hue = hueFor(seed)
  return (
    <span
      aria-hidden
      className={cx("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        lineHeight: 1,
        background: `oklch(var(--avbl) 0.05 ${hue})`,
        color: `oklch(var(--avfl) 0.1 ${hue})`,
      }}
    >
      {initials(name)}
      {photoURL ? (
        <img
          src={photoURL}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full rounded-full object-cover shadow-[inset_0_0_0_1px_var(--ln)]"
          onError={(event) => event.currentTarget.remove()}
        />
      ) : null}
    </span>
  )
}

export function AvatarStack({
  people,
  size = 32,
  max = 5,
}: {
  people: { uid: string; name: string; photoURL: string | null }[]
  size?: number
  max?: number
}) {
  return (
    <span className="flex" aria-hidden>
      {people.slice(0, max).map((person, index) => (
        <Avatar
          key={person.uid}
          name={person.name}
          photoURL={person.photoURL}
          seed={person.uid}
          size={size}
          className={cx("ring-2 ring-bg", index > 0 && "-ml-2")}
        />
      ))}
    </span>
  )
}

const MEDAL_COLORS = ["bg-medal-gold", "bg-medal-silver", "bg-medal-bronze"]

export function Medal({ position, size = 28 }: { position: number; size?: number }) {
  return (
    <span
      role="img"
      aria-label={`${position}.º puesto`}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-medal-ink tabular-nums shadow-[inset_0_0_0_1.5px_rgba(0,0,0,.14)]",
        MEDAL_COLORS[position - 1] ?? "bg-medal-silver",
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5), lineHeight: 1 }}
    >
      {position}
    </span>
  )
}

/** Medalla para 1.º–3.º, número para el resto, y "–" cuando nadie ha comido todavía. */
export function PositionMark({ position, size = 28, blank = false }: { position: number; size?: number; blank?: boolean }) {
  return (
    <span className="flex w-8 shrink-0 items-center justify-center">
      {blank ? (
        <span className="text-[17px] leading-none font-semibold text-ink-3">–</span>
      ) : position <= 3 ? (
        <Medal position={position} size={size} />
      ) : (
        <span className="text-[17px] leading-none font-semibold text-ink-2 tabular-nums" aria-label={`${position}.º puesto`}>
          {position}
        </span>
      )}
    </span>
  )
}

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={cx("block shrink-0", className)} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="var(--fg)" />
      <circle cx="24" cy="24" r="16.5" fill="var(--bg)" />
      <circle cx="24" cy="24" r="7.5" fill="var(--ac)" />
    </svg>
  )
}

/* ── Estadísticas ──────────────────────────────────────────────────────── */

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl className={cx("grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line", className)}>
      {children}
    </dl>
  )
}

export function Stat({ label, value, sub, small = false }: { label: string; value: ReactNode; sub?: ReactNode; small?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-bg px-4 pt-4 pb-[18px]">
      <dt className="text-caption font-medium text-ink-2">{label}</dt>
      <dd
        className={cx(
          "truncate font-semibold tracking-[-0.02em] text-ink tabular-nums",
          small ? "text-[22px] leading-[38px]" : "text-[32px] leading-[38px]",
        )}
      >
        {value}
      </dd>
      {sub ? <dd className="text-caption text-ink-3">{sub}</dd> : null}
    </div>
  )
}

/* ── Vacíos y cargas ───────────────────────────────────────────────────── */

export function Empty({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full border border-line-strong text-ink-2">
        <Icon size={26} aria-hidden />
      </span>
      <p className="text-[20px] leading-[26px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
      {children ? <p className="max-w-[290px] text-body text-pretty text-ink-2">{children}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  // Sin radio por defecto: quien lo usa marca la forma del contenido que sustituye.
  return <span aria-hidden className={cx("block animate-skeleton bg-sf", className)} />
}

export function FullScreenLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6" role="status">
      <Logo size={72} />
      <div className="flex items-center gap-2.5 text-body-lg font-medium text-ink-2">
        <Spinner />
        {label}
      </div>
    </div>
  )
}

/* ── Texto ─────────────────────────────────────────────────────────────── */

export function ScreenTitle({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <header>
      <h1 className="text-title text-ink lg:text-[40px] lg:leading-[46px]">{title}</h1>
      {subtitle ? <p className="mt-1 text-body-lg text-ink-2">{subtitle}</p> : null}
    </header>
  )
}
