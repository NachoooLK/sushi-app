"use client"

import { useState } from "react"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GoogleAuthTest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const testGoogleAuth = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      const result = await signInWithPopup(auth, provider)
      
      setSuccess(`✅ Google Auth funciona correctamente! Usuario: ${result.user.displayName}`)
      console.log("Google Auth result:", result)
    } catch (error: any) {
      console.error("Google Auth error:", error)
      setError(`❌ Error: ${error.code} - ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Google Auth</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testGoogleAuth} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Probando..." : "Probar Google Auth"}
        </Button>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 