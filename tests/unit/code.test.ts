import { describe, expect, it } from "vitest"
import { CODE_ALPHABET, formatCode, generateCode, normalizeCode } from "@/lib/code"

describe("generateCode", () => {
  it("genera 6 caracteres del alfabeto sin ambigüedades", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateCode()
      expect(code).toHaveLength(6)
      for (const char of code) expect(CODE_ALPHABET).toContain(char)
    }
  })

  it("nunca usa 0, O, 1 ni I", () => {
    expect(CODE_ALPHABET).not.toMatch(/[01OI]/)
  })

  it("mapea los bytes al alfabeto de forma determinista", () => {
    expect(generateCode(() => new Uint8Array([0, 1, 31, 32, 63, 255]))).toBe("AB9A99")
  })
})

describe("normalizeCode", () => {
  it("acepta minúsculas, espacios y guiones", () => {
    expect(normalizeCode(" k7p 2qx ")).toBe("K7P2QX")
    expect(normalizeCode("k7p-2qx")).toBe("K7P2QX")
  })

  it("extrae el código de un enlace completo", () => {
    expect(normalizeCode("https://sushi.app/mesa/K7P2QX/resultado")).toBe("K7P2QX")
  })

  it("rechaza longitudes o caracteres inválidos", () => {
    expect(normalizeCode("K7P2Q")).toBeNull()
    expect(normalizeCode("K7P2QXX")).toBeNull()
    expect(normalizeCode("K7P2Q0")).toBeNull()
    expect(normalizeCode("")).toBeNull()
  })

  it("formatea en dos bloques para leerlo en voz alta", () => {
    expect(formatCode("K7P2QX")).toBe("K7P 2QX")
  })
})
