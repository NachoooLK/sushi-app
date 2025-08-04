"use client"

import { createContext, useContext, useState, useEffect } from "react"

export type Theme = "sushi" | "ocean" | "forest" | "sunset" | "purple"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: { id: Theme; name: string; colors: ThemeColors }[]
}

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  card: string
  text: string
}

const themes: { id: Theme; name: string; colors: ThemeColors }[] = [
  {
    id: "sushi",
    name: "🍣 Sushi",
    colors: {
      primary: "from-orange-500 to-red-500",
      secondary: "from-orange-50 to-red-50",
      accent: "orange",
      background: "from-orange-50 via-red-50 to-pink-50",
      card: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
      text: "text-orange-600"
    }
  },
  {
    id: "ocean",
    name: "🌊 Océano",
    colors: {
      primary: "from-blue-500 to-cyan-500",
      secondary: "from-blue-50 to-cyan-50",
      accent: "blue",
      background: "from-blue-50 via-cyan-50 to-teal-50",
      card: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
      text: "text-blue-600"
    }
  },
  {
    id: "forest",
    name: "🌲 Bosque",
    colors: {
      primary: "from-green-500 to-emerald-500",
      secondary: "from-green-50 to-emerald-50",
      accent: "green",
      background: "from-green-50 via-emerald-50 to-teal-50",
      card: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
      text: "text-green-600"
    }
  },
  {
    id: "sunset",
    name: "🌅 Atardecer",
    colors: {
      primary: "from-pink-500 to-orange-500",
      secondary: "from-pink-50 to-orange-50",
      accent: "pink",
      background: "from-pink-50 via-orange-50 to-yellow-50",
      card: "border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100",
      text: "text-pink-600"
    }
  },
  {
    id: "purple",
    name: "💜 Púrpura",
    colors: {
      primary: "from-purple-500 to-indigo-500",
      secondary: "from-purple-50 to-indigo-50",
      accent: "purple",
      background: "from-purple-50 via-indigo-50 to-blue-50",
      card: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
      text: "text-purple-600"
    }
  }
]

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("sushi")

  useEffect(() => {
    const savedTheme = localStorage.getItem("sushi-counter-theme") as Theme
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("sushi-counter-theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
