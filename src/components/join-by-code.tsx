"use client"

import { CircleAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useState, type FormEvent } from "react"
import { normalizeCode } from "@/lib/code"
import { tableHref } from "@/lib/routes"
import { Button, cx, Field } from "./ui"

const CODE_ERROR = "El código tiene 6 caracteres, por ejemplo K7P 2QX."

/** "¿Te han pasado un código?": campo de código (admite pegar el enlace de la mesa) + "Unirme". */
export function JoinByCode({ className }: { className?: string }) {
  const router = useRouter()
  const titleId = useId()
  const errorId = useId()
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    const code = normalizeCode(value)
    if (!code) {
      setError(true)
      return
    }
    setError(false)
    router.push(tableHref(code))
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby={titleId} className={cx("flex flex-col gap-2.5", className)}>
      <h2 id={titleId} className="text-[15px] leading-5 font-semibold text-ink">
        ¿Te han pasado un código?
      </h2>
      <div className="flex items-start gap-2.5">
        <Field
          code
          aria-labelledby={titleId}
          aria-describedby={error ? errorId : undefined}
          placeholder="K7P 2QX"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            if (error) setError(false)
          }}
          // El mensaje va en una línea propia bajo la fila (como en el diseño); el campo solo marca el error.
          invalid={error}
          className="flex-1"
        />
        <Button type="submit" kind="secondary" className="w-[100px] px-0">
          Unirme
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-2 text-[14px] leading-5 font-medium text-danger">
          <CircleAlert size={18} className="mt-px shrink-0" aria-hidden />
          <span>{CODE_ERROR}</span>
        </p>
      ) : null}
    </form>
  )
}
