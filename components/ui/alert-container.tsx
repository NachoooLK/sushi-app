"use client"

import { AlertNotification, useAlertNotifications } from "./alert-notification"

export function AlertContainer() {
  const { alerts, removeAlert } = useAlertNotifications()

  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none p-6">
      <div className="relative">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className="pointer-events-auto mb-4"
            style={{
              transform: `translateY(${index * 20}px)`,
            }}
          >
            <AlertNotification
              {...alert}
              onClose={removeAlert}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook global para usar las alertas desde cualquier componente
let alertFunctions: ReturnType<typeof useAlertNotifications> | null = null

export function setAlertFunctions(functions: ReturnType<typeof useAlertNotifications>) {
  alertFunctions = functions
}

export function showAlert(alert: Parameters<ReturnType<typeof useAlertNotifications>['addAlert']>[0]) {
  if (alertFunctions) {
    alertFunctions.addAlert(alert)
  }
}

export function showSuccessAlert(title: string, description?: string) {
  showAlert({ 
    title, 
    description, 
    type: "success",
    duration: 4000
  })
}

export function showErrorAlert(title: string, description?: string) {
  showAlert({ 
    title, 
    description, 
    type: "error",
    duration: 6000
  })
}

export function showWarningAlert(title: string, description?: string) {
  showAlert({ 
    title, 
    description, 
    type: "warning",
    duration: 5000
  })
}

export function showInfoAlert(title: string, description?: string) {
  showAlert({ 
    title, 
    description, 
    type: "info",
    duration: 4000
  })
} 