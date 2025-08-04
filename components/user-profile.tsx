"use client"

import { type User, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, Palette, User, Shield, HelpCircle, ChevronRight, Crown, Bell, Moon, Sun } from "lucide-react"
import { useAlerts } from "@/hooks/use-alerts"
import { useTheme, type Theme } from "@/components/theme-provider"
import { useState, useRef, useEffect } from "react"
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
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const menuItems = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: User,
      action: () => console.log('Perfil'),
      badge: 'Pro'
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: Settings,
      action: () => setShowSettings(true)
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: Bell,
      action: () => console.log('Notificaciones'),
      badge: '3'
    },
    {
      id: 'help',
      label: 'Ayuda',
      icon: HelpCircle,
      action: () => setShowHelp(true)
    },
    {
      id: 'privacy',
      label: 'Privacidad',
      icon: Shield,
      action: () => setShowPrivacy(true)
    }
  ]

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Avatar Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative group"
        >
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg transition-all duration-200 group-hover:ring-orange-300 group-hover:scale-105">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-16 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-xl">
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {user.displayName || "Usuario"}
                  </h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <Crown className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-xs text-gray-500">Miembro Premium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-orange-100 transition-colors duration-200">
                      <item.icon className="h-5 w-5 text-gray-600 group-hover:text-orange-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.badge === 'Pro' 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </button>
              ))}

              {/* Theme Selector */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-700">Tema</span>
                  <Palette className="h-4 w-4 text-gray-500" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {themes.slice(0, 3).map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        theme === themeOption.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-3 rounded-full bg-gradient-to-r ${themeOption.colors.primary} mb-2`}></div>
                      <span className="text-xs font-medium text-gray-700">{themeOption.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleSignOut()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
