"use client"

import { AlertNotification, useAlertNotifications } from "./alert-notification"

export function AlertContainer() {
  const { alerts, removeAlert } = useAlertNotifications()

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="relative">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 80}px)`,
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
  showAlert({ title, description, type: "success" })
}

export function showErrorAlert(title: string, description?: string) {
  showAlert({ title, description, type: "error" })
}

export function showWarningAlert(title: string, description?: string) {
  showAlert({ title, description, type: "warning" })
}

export function showInfoAlert(title: string, description?: string) {
  showAlert({ title, description, type: "info" })
} 