// Sin 0/O ni 1/I para que el código se pueda dictar en voz alta en la mesa.
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
export const CODE_LENGTH = 6

const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`)

export function generateCode(randomValues: (length: number) => Uint8Array = cryptoRandom) {
  const bytes = randomValues(CODE_LENGTH)
  let code = ""
  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length]
  }
  return code
}

/** Acepta "abc-123", " ABC 123 " o un enlace completo y devuelve el código, o null si no es válido. */
export function normalizeCode(input: string): string | null {
  const fromLink = input.match(/\/s\/([A-Za-z0-9-]+)/)
  const raw = (fromLink ? fromLink[1] : input).toUpperCase().replace(/[^A-Z0-9]/g, "")
  return CODE_PATTERN.test(raw) ? raw : null
}

export function formatCode(code: string) {
  return `${code.slice(0, 3)} ${code.slice(3)}`
}

function cryptoRandom(length: number) {
  return crypto.getRandomValues(new Uint8Array(length))
}
