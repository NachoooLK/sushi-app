"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function TestFirebase() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("123456")
  const [loading, setLoading] = useState(false)

  const testSignUp = async () => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      toast({
        title: "✅ Usuario creado exitosamente",
        description: `UID: ${userCredential.user.uid}`,
      })
    } catch (error: any) {
      console.error("Error en test:", error)
      toast({
        title: "❌ Error en test",
        description: error.code || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testSignIn = async () => {
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      toast({
        title: "✅ Login exitoso",
        description: `Usuario: ${userCredential.user.email}`,
      })
    } catch (error: any) {
      console.error("Error en test:", error)
      toast({
        title: "❌ Error en login",
        description: error.code || error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Test Firebase</h3>
      <div className="space-y-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <div className="flex gap-2">
          <Button onClick={testSignUp} disabled={loading}>
            Test SignUp
          </Button>
          <Button onClick={testSignIn} disabled={loading}>
            Test SignIn
          </Button>
        </div>
      </div>
    </div>
  )
} 