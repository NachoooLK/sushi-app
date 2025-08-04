"use client"

import type React from "react"

import { useState } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión correctamente",
      })
    } catch (error: any) {
      console.error("Error en login:", error)
      
      let errorMessage = "Error al iniciar sesión"
      if (error.code === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de conexión. Verifica tu internet"
      }

      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    
    try {
      const provider = new GoogleAuthProvider()
      // Agregar scopes adicionales si es necesario
      provider.addScope('email')
      provider.addScope('profile')
      
      const result = await signInWithPopup(auth, provider)
      
      // Crear o actualizar documento de usuario en Firestore
      const userRef = doc(db, "users", result.user.uid)
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        totalSushi: 0,
        gamesPlayed: 0,
        wins: 0,
        createdAt: new Date()
      }, { merge: true })

      toast({
        title: "¡Bienvenido con Google!",
        description: `Has iniciado sesión como ${result.user.displayName}`,
      })
    } catch (error: any) {
      console.error("Error en Google sign in:", error)
      
      let errorMessage = "Error al iniciar sesión con Google"
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Inicio de sesión cancelado"
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup bloqueado por el navegador. Permite popups para este sitio"
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage = "Dominio no autorizado. Contacta al administrador"
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Google Sign-In no está habilitado. Contacta al administrador"
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de conexión. Verifica tu internet"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos. Intenta más tarde"
      }

      toast({
        title: "Error con Google",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🚀 Iniciando registro...")
    console.log("📧 Email:", email)
    console.log("👤 DisplayName:", displayName)
    console.log("🔒 Password length:", password.length)
    
    // Validaciones básicas
    if (!email || !password || !displayName) {
      console.log("❌ Validación fallida: campos vacíos")
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      console.log("❌ Validación fallida: contraseña muy corta")
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    console.log("✅ Validaciones pasadas, iniciando Firebase...")
    setLoading(true)

    try {
      console.log("🔥 Creando usuario en Firebase...")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("✅ Usuario creado:", userCredential.user.uid)
      
      console.log("👤 Actualizando perfil...")
      await updateProfile(userCredential.user, { displayName })
      console.log("✅ Perfil actualizado")

      console.log("📄 Creando documento en Firestore...")
      // Crear documento del usuario en Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName,
        email,
        totalSushi: 0,
        gamesPlayed: 0,
        wins: 0,
        createdAt: new Date(),
      })
      console.log("✅ Documento creado en Firestore")

      console.log("🎉 Registro completado exitosamente")
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente",
      })
    } catch (error: any) {
      console.error("❌ Error en registro:", error)
      
      let errorMessage = "Error al crear cuenta"
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil"
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de conexión. Verifica tu internet"
      }

      toast({
        title: "Error al crear cuenta",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 md:p-4 bg-gradient-to-br ${currentTheme?.colors.background}`}>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center pb-6 md:pb-8">
          <div className="text-7xl md:text-9xl mb-6 md:mb-8 animate-pulse">🍣</div>
          <CardTitle className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${currentTheme?.colors.primary} bg-clip-text text-transparent`}>
            Sushi Rush
          </CardTitle>
          <CardDescription className="text-lg md:text-xl text-gray-600 mt-3">
            ¡Compite con tus amigos contando sushi en tiempo real!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-14 px-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 text-base"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 px-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 text-base"
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className={`w-full h-14 ${currentTheme?.colors.button} text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando...</span>
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-displayName" className="text-sm font-medium text-gray-700">
                    Nombre de usuario
                  </Label>
                  <Input
                    id="register-displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="h-14 px-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 text-base"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-14 px-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 text-base"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 px-4 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 text-base"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className={`w-full h-14 ${currentTheme?.colors.button} text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creando cuenta...</span>
                    </div>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {/* Botón de Google */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">O continúa con</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-14 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              {googleLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continuar con Google</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
