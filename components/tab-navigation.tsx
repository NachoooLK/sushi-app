"use client"

import { Button } from "@/components/ui/button"
import { Users, Trophy, Calendar, Target, Heart } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

  const tabs = [
    {
      id: "rooms",
      label: "Salas",
      icon: Users,
      description: "Crear y unirse a salas"
    },
    {
      id: "rankings",
      label: "Rankings",
      icon: Trophy,
      description: "Ver clasificaciones"
    },
    {
      id: "history",
      label: "Historial",
      icon: Calendar,
      description: "Partidas anteriores"
    },
    {
      id: "credits",
      label: "Créditos",
      icon: Heart,
      description: "Información del desarrollador"
    }
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <Button
            key={tab.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive 
                ? `${currentTheme?.colors.button} text-white shadow-md` 
                : 'bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.charAt(0)}</span>
          </Button>
        )
      })}
    </div>
  )
} 