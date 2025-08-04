import { useTheme } from "@/components/theme-provider"

export function useThemeStyles() {
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

  const getThemeClasses = () => {
    if (!currentTheme) return {}

    return {
      background: `bg-gradient-to-br ${currentTheme.colors.background}`,
      primary: `bg-gradient-to-r ${currentTheme.colors.primary}`,
      secondary: `bg-gradient-to-r ${currentTheme.colors.secondary}`,
      card: currentTheme.colors.card,
      text: currentTheme.colors.text,
      button: currentTheme.colors.button,
      accent: `text-${currentTheme.colors.accent}-600`,
      border: `border-${currentTheme.colors.accent}-200`,
    }
  }

  return {
    theme,
    currentTheme,
    getThemeClasses,
  }
} 