"use client"

import { useState } from "react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const currentTheme = themes.find(t => t.id === theme)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Tema: {currentTheme?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themeOption.colors.primary}`}></div>
              <span>{themeOption.name}</span>
            </div>
            {theme === themeOption.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemePreview() {
  const { themes, theme } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

  return (
    <Card className={`${currentTheme?.colors.card} transition-all duration-300`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
          <Palette className="h-5 w-5" />
          Tema Actual
        </CardTitle>
        <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tema seleccionado:</span>
            <Badge variant="outline" className={currentTheme?.colors.text}>
              {currentTheme?.name}
            </Badge>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {themes.map((themeOption) => (
              <div
                key={themeOption.id}
                className={`w-8 h-8 rounded-full bg-gradient-to-r ${themeOption.colors.primary} cursor-pointer transition-transform hover:scale-110 ${
                  theme === themeOption.id ? 'ring-2 ring-black ring-offset-2' : ''
                }`}
                title={themeOption.name}
              />
            ))}
          </div>
          
          <ThemeSelector />
        </div>
      </CardContent>
    </Card>
  )
} 