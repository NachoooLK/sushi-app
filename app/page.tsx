"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import LoginForm from "@/components/login-form"
import Dashboard from "@/components/dashboard"
import Credits from "@/components/credits"

import { Loader2 } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🔍 Iniciando verificación de autenticación...")
    
    // Timeout para evitar que se quede cargando indefinidamente
    const timeout = setTimeout(() => {
      console.log("⏰ Timeout alcanzado, mostrando formulario de login")
      setLoading(false)
      setError("Tiempo de carga excedido")
    }, 10000) // 10 segundos

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("✅ Estado de autenticación actualizado:", user ? "Usuario logueado" : "Sin usuario")
      clearTimeout(timeout)
      setUser(user)
      setLoading(false)
    }, (error) => {
      console.error("❌ Error en autenticación:", error)
      clearTimeout(timeout)
      setError(error.message)
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🍣</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Sushi Rush
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Inicializando aplicación...</p>
          </div>
          <p className="text-sm text-gray-500">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {user ? (
        <Dashboard user={user} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-red-500 text-xs mt-1">Puedes continuar con el login manual</p>
            </div>
          )}
          <LoginForm />
          <div className="mt-8 max-w-md w-full">
            <Credits />
          </div>
        </div>
      )}
    </div>
  )
}
