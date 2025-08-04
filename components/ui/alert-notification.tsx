"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle, Info, X, Bell, Sparkles, Star, Zap } from "lucide-react"
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
    container: "bg-white border-l-4 border-l-green-500 shadow-xl",
    icon: CheckCircle,
    iconColor: "text-green-500",
    accent: "bg-green-500",
    badge: "bg-green-100 text-green-700",
    glow: "shadow-green-100"
  },
  error: {
    container: "bg-white border-l-4 border-l-red-500 shadow-xl",
    icon: XCircle,
    iconColor: "text-red-500",
    accent: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    glow: "shadow-red-100"
  },
  warning: {
    container: "bg-white border-l-4 border-l-yellow-500 shadow-xl",
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    accent: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-700",
    glow: "shadow-yellow-100"
  },
  info: {
    container: "bg-white border-l-4 border-l-blue-500 shadow-xl",
    icon: Info,
    iconColor: "text-blue-500",
    accent: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700",
    glow: "shadow-blue-100"
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
        "fixed top-6 right-6 z-[9999]",
        "w-96 max-w-sm",
        "rounded-xl border shadow-2xl",
        "transform transition-all duration-500 ease-out",
        "animate-in slide-in-from-right-4 duration-500",
        isAnimating && "animate-out slide-out-to-right-4 duration-300",
        styles.container,
        styles.glow
      )}
    >
      {/* Floating badge */}
      <div className={cn(
        "absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center",
        "border-2 border-white shadow-lg",
        styles.accent
      )}>
        <Star className="h-4 w-4 text-white" />
      </div>

      <div className="p-6 pt-8">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-gray-50 to-gray-100",
              "border border-gray-200"
            )}>
              <Icon className={cn("h-6 w-6", styles.iconColor)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <h4 className="font-bold text-gray-900 text-base">{title}</h4>
            </div>
            {description && (
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            )}
            
            {/* Type badge */}
            <div className="flex items-center gap-2 mt-3">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                styles.badge
              )}>
                {type === 'success' && '✅ Éxito'}
                {type === 'error' && '❌ Error'}
                {type === 'warning' && '⚠️ Advertencia'}
                {type === 'info' && 'ℹ️ Información'}
              </span>
            </div>
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
            className="h-8 w-8 p-0 opacity-60 hover:opacity-100 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-100 ease-linear",
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