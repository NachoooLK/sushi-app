"use client"

import { useToast } from "./use-toast"
import { showSuccessAlert, showErrorAlert, showWarningAlert, showInfoAlert } from "@/components/ui/alert-container"

export function useAlerts() {
  const { toast } = useToast()

  const showSuccess = (title: string, description?: string) => {
    // Mostrar tanto toast como alerta
    toast({
      title,
      description,
      variant: "default",
    })
    showSuccessAlert(title, description)
  }

  const showError = (title: string, description?: string) => {
    // Mostrar tanto toast como alerta
    toast({
      title,
      description,
      variant: "destructive",
    })
    showErrorAlert(title, description)
  }

  const showWarning = (title: string, description?: string) => {
    // Mostrar tanto toast como alerta
    toast({
      title,
      description,
      variant: "default",
    })
    showWarningAlert(title, description)
  }

  const showInfo = (title: string, description?: string) => {
    // Mostrar tanto toast como alerta
    toast({
      title,
      description,
      variant: "default",
    })
    showInfoAlert(title, description)
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    toast, // Mantener acceso al toast original
  }
} 