const dayFormat = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" })
const dayYearFormat = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })
const monthFormat = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" })
const timeFormat = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" })

export function formatDay(date: Date | null, now = new Date()) {
  if (!date) return ""
  const sameYear = date.getFullYear() === now.getFullYear()
  return (sameYear ? dayFormat : dayYearFormat).format(date).replace(".", "")
}

export function formatMonth(date: Date) {
  const label = monthFormat.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatTime(date: Date | null) {
  return date ? timeFormat.format(date) : ""
}

/** 0:42:07 para el cronómetro en directo. */
export function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

/** "1 h 25 min" para resúmenes. */
export function formatDuration(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export function pieces(count: number) {
  return `${count} ${count === 1 ? "pieza" : "piezas"}`
}

export function ordinal(position: number) {
  return `${position}.º`
}

export function decimal(value: number) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 1 })
}
