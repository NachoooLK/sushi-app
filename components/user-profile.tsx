"use client"

import { type User, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, Palette, User, Shield, HelpCircle } from "lucide-react"
import { useAlerts } from "@/hooks/use-alerts"
import { useTheme, type Theme } from "@/components/theme-provider"
import { useState } from "react"
import UserSettings from "./user-settings"
import PrivacyPolicy from "./privacy-policy"
import HelpSupport from "./help-support"

interface UserProfileProps {
  user: User
}

export default function UserProfile({ user }: UserProfileProps) {
  const { theme, setTheme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)
  const { showSuccess, showError } = useAlerts()
  const [showSettings, setShowSettings] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      showSuccess(
        "Sesión cerrada",
        "Has cerrado sesión correctamente"
      )
    } catch (error: any) {
      showError(
        "Error al cerrar sesión",
        error.message
      )
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    showSuccess(
      "Tema cambiado",
      `Cambiado a tema ${themes.find(t => t.id === newTheme)?.name}`
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || "Usuario"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Perfil y Configuración */}
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer" onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Ajustes</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Temas */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Palette className="mr-2 h-4 w-4" />
              <span>Temas</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {themes.map((themeOption) => (
                <DropdownMenuItem
                  key={themeOption.id}
                  onClick={() => handleThemeChange(themeOption.id)}
                  className={`cursor-pointer flex items-center justify-between ${
                    theme === themeOption.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${themeOption.colors.primary}`}></div>
                    <span className="text-sm">{themeOption.name}</span>
                  </div>
                  {theme === themeOption.id && <Palette className="h-3 w-3" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          
          {/* Ayuda y Soporte */}
          <DropdownMenuItem className="cursor-pointer" onClick={() => setShowHelp(true)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Ayuda</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer" onClick={() => setShowPrivacy(true)}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Privacidad</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Cerrar Sesión */}
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modales */}
      {showSettings && (
        <UserSettings user={user} onClose={() => setShowSettings(false)} />
      )}
      
      {showPrivacy && (
        <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
      )}
      
      {showHelp && (
        <HelpSupport onClose={() => setShowHelp(false)} />
      )}
    </>
  )
}
