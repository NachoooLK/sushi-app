"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle, Info, X, Bell, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AlertNotificationProps {
  id: string
  title: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose: (id: string) => void
}

const alertStyles = {
  success: {
    container: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-600",
    accent: "from-green-400 to-emerald-400",
    glow: "shadow-green-200"
  },
  error: {
    container: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800",
    icon: XCircle,
    iconColor: "text-red-600",
    accent: "from-red-400 to-pink-400",
    glow: "shadow-red-200"
  },
  warning: {
    container: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800",
    icon: AlertCircle,
    iconColor: "text-yellow-600",
    accent: "from-yellow-400 to-orange-400",
    glow: "shadow-yellow-200"
  },
  info: {
    container: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800",
    icon: Info,
    iconColor: "text-blue-600",
    accent: "from-blue-400 to-cyan-400",
    glow: "shadow-blue-200"
  }
}

export function AlertNotification({
  id,
  title,
  description,
  type = "info",
  duration = 5000,
  onClose
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const styles = alertStyles[type]
  const Icon = styles.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsAnimating(true)
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(() => onClose(id), 300)
        }, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999]",
        "max-w-md w-full mx-4",
        "border-2 rounded-2xl shadow-2xl backdrop-blur-sm",
        "animate-in slide-in-from-top-4 duration-500",
        isAnimating && "animate-out slide-out-to-top-4 duration-300",
        styles.container,
        styles.glow
      )}
    >
      {/* Header with gradient accent */}
      <div className={cn(
        "h-1 bg-gradient-to-r rounded-t-2xl",
        styles.accent
      )} />
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon with animated background */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-r opacity-20 animate-pulse",
              styles.accent
            )} />
            <div className="relative p-3 rounded-full bg-white/80 backdrop-blur-sm border-2 border-white/50">
              <Icon className={cn("h-6 w-6", styles.iconColor)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <h4 className="font-bold text-lg">{title}</h4>
            </div>
            {description && (
              <p className="text-sm opacity-90 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAnimating(true)
              setTimeout(() => {
                setIsVisible(false)
                setTimeout(() => onClose(id), 300)
              }, 300)
            }}
            className="h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-white/50 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full bg-gradient-to-r rounded-full transition-all duration-100 ease-linear",
                styles.accent
              )}
              style={{
                width: isAnimating ? '0%' : '100%',
                transition: isAnimating ? 'width 0.3s ease-out' : `width ${duration}ms linear`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Hook para manejar múltiples alertas
export function useAlertNotifications() {
  const [alerts, setAlerts] = useState<AlertNotificationProps[]>([])

  const addAlert = (alert: Omit<AlertNotificationProps, "id" | "onClose">) => {
    const id = Date.now().toString()
    const newAlert: AlertNotificationProps = {
      ...alert,
      id,
      onClose: (alertId: string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId))
      }
    }
    setAlerts(prev => [...prev, newAlert])
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return {
    alerts,
    addAlert,
    removeAlert
  }
} 