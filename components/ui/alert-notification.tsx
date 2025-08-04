"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react"
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
    container: "bg-green-50 border-green-200 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-600"
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: XCircle,
    iconColor: "text-red-600"
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: AlertCircle,
    iconColor: "text-yellow-600"
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Info,
    iconColor: "text-blue-600"
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
  const styles = alertStyles[type]
  const Icon = styles.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(id), 300) // Wait for animation
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
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]",
        "max-w-md w-full mx-4",
        "border rounded-lg shadow-lg p-4",
        "animate-in slide-in-from-top-2 duration-300",
        styles.container
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", styles.iconColor)} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{title}</h4>
          {description && (
            <p className="text-sm mt-1 opacity-90">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(id), 300)
          }}
          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </Button>
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