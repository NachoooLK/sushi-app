"use client"

import { X } from "lucide-react"
import { useEffect, useId, useRef, type ReactNode } from "react"

/**
 * Hoja inferior en móvil y diálogo centrado de 480 px a partir de 768 px.
 * Sobre <dialog> nativo: foco atrapado, Escape y devolución del foco al disparador.
 */
export function Sheet({
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
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[28px] border-t border-line bg-raised p-0 text-ink shadow-sheet animate-sheet-in md:m-auto md:w-[480px] md:rounded-dialog md:border md:shadow-dialog md:animate-dialog-in"
    >
      {open ? (
        <div className="px-5 pt-2.5 pb-[max(20px,env(safe-area-inset-bottom))] md:px-8 md:pt-6 md:pb-8">
          <div className="mx-auto mb-1.5 h-[5px] w-10 rounded-[3px] bg-line-strong opacity-60 md:hidden" aria-hidden />
          <div className="flex min-h-12 items-center justify-between gap-4">
            {/* El título recibe el foco al abrir (autofocus nativo del <dialog>), no la X. */}
            <h2
              id={titleId}
              tabIndex={-1}
              ref={(node) => node?.setAttribute("autofocus", "")}
              className="text-h2 text-ink outline-none focus-visible:shadow-none"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-sf"
            >
              <X size={24} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  )
}
