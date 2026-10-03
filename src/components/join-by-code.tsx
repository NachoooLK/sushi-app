"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { normalizeCode } from "@/lib/code"
import { Button } from "./ui"

export function JoinByCode() {
  const router = useRouter()
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const code = normalizeCode(value)
    if (!code) {
      setError("El código tiene 6 caracteres, por ejemplo K7P 2QX.")
      return
    }
    router.push(`/s/${code}`)
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="join-code" className="mb-1.5 block text-sm font-medium">
        ¿Te han pasado un código?
      </label>
      <div className="flex gap-2">
        <input
          id="join-code"
          value={value}
          onChange={(event) => {
            setValue(event.target.value.toUpperCase())
            setError(null)
          }}
          placeholder="K7P 2QX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "join-code-error" : undefined}
          className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 font-display text-lg font-bold uppercase tracking-[0.2em] text-ink outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
        <Button type="submit" variant="secondary" className="h-12 px-4" aria-label="Unirme a la mesa">
          Unirme
          <ArrowRight className="size-4" />
        </Button>
      </div>
      {error ? (
        <p id="join-code-error" role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </form>
  )
}
