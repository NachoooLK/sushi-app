"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Minus, Trophy, Target, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SoloMode() {
  const { user } = useAuth()
  const [sushiCount, setSushiCount] = useState(0)
  const [gameHistory, setGameHistory] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const updateSushiCount = (increment: number) => {
    const newCount = Math.max(0, sushiCount + increment)
    setSushiCount(newCount)
    
    if (newCount > 0 && !isPlaying) {
      setIsPlaying(true)
    }
  }

  const finishGame = async () => {
    if (sushiCount > 0 && user) {
      try {
        // Actualizar estadísticas del usuario
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          await updateDoc(userRef, {
            totalSushi: increment(sushiCount),
            gamesPlayed: increment(1),
            wins: increment(1) // En modo solitario siempre "ganas"
          })
        } else {
          // Crear documento de usuario si no existe
          await setDoc(userRef, {
            totalSushi: sushiCount,
            gamesPlayed: 1,
            wins: 1
          })
        }

        setGameHistory(prev => [...prev, sushiCount])
        toast({
          title: "¡Juego terminado!",
          description: `Comiste ${sushiCount} piezas de sushi. Estadísticas actualizadas.`,
        })
        setSushiCount(0)
        setIsPlaying(false)
      } catch (error) {
        console.error('Error updating stats:', error)
        toast({
          title: "Error al actualizar estadísticas",
          description: "El juego se guardó localmente",
          variant: "destructive",
        })
        setGameHistory(prev => [...prev, sushiCount])
        setSushiCount(0)
        setIsPlaying(false)
      }
    }
  }

  const resetGame = () => {
    setSushiCount(0)
    setIsPlaying(false)
  }

  const getAverageSushi = () => {
    if (gameHistory.length === 0) return 0
    const total = gameHistory.reduce((sum, count) => sum + count, 0)
    return Math.round(total / gameHistory.length)
  }

  const getBestScore = () => {
    if (gameHistory.length === 0) return 0
    return Math.max(...gameHistory)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-3 md:p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2 text-sm md:text-base">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <Badge variant="outline" className="text-xs md:text-sm">
            <Target className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Modo Solitario
          </Badge>
        </div>

        <div className="grid gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-center">🍣 Modo Solitario</CardTitle>
              <CardDescription className="text-center text-sm md:text-base">
                ¡Juega solo y ve cuántos sushis puedes comer!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl md:text-3xl">Tu contador</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4 md:space-y-6">
              <div className="text-6xl md:text-8xl font-bold text-orange-600">{sushiCount}</div>
              <div className="text-4xl md:text-6xl">🍣</div>
              <div className="flex justify-center gap-3 md:gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => updateSushiCount(-1)}
                  disabled={sushiCount === 0}
                  className="h-12 w-12 md:h-16 md:w-16 rounded-full"
                >
                  <Minus className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => updateSushiCount(1)}
                  className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
              </div>
              
              {isPlaying && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={finishGame} className="bg-green-600 hover:bg-green-700">
                    <Trophy className="h-4 w-4 mr-2" />
                    Terminar Juego
                  </Button>
                  <Button variant="outline" onClick={resetGame}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {gameHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{getBestScore()}</div>
                    <div className="text-sm text-gray-600">Mejor puntuación</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{getAverageSushi()}</div>
                    <div className="text-sm text-gray-600">Promedio</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Historial de juegos:</h4>
                  <div className="space-y-2">
                    {gameHistory.slice(-5).reverse().map((count, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>Juego #{gameHistory.length - index}</span>
                        <Badge variant="secondary">🍣 {count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 