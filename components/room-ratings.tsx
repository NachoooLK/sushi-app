"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MessageSquare, Plus } from "lucide-react"
import { useAlerts } from "@/hooks/use-alerts"
import type { RoomRating } from "@/hooks/use-rooms"

interface RoomRatingsProps {
  roomId: string
  ratings: RoomRating[]
  currentUserId: string
  currentUserName: string
  onAddRating: (rating: Omit<RoomRating, 'id' | 'createdAt'>) => Promise<void>
}

export default function RoomRatings({ 
  roomId, 
  ratings, 
  currentUserId, 
  currentUserName,
  onAddRating 
}: RoomRatingsProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useAlerts()

  const hasUserRated = ratings.some(r => r.playerId === currentUserId)

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1 || rating > 5) return

    setLoading(true)
    try {
      await onAddRating({
        playerId: currentUserId,
        playerName: currentUserName,
        rating,
        comment: comment.trim() || undefined
      })

      showSuccess(
        "¡Puntuación agregada!",
        "Tu opinión ha sido registrada"
      )

      setShowAddForm(false)
      setRating(5)
      setComment("")
    } catch (error: any) {
      showError(
        "Error al agregar puntuación",
        error.message
      )
    } finally {
      setLoading(false)
    }
  }

  const getSushiEmojis = (rating: number) => {
    const sushi = "🍣"
    const empty = "⚪"
    return sushi.repeat(rating) + empty.repeat(5 - rating)
  }

  const getAverageRating = () => {
    if (ratings.length === 0) return 0
    const total = ratings.reduce((sum, r) => sum + r.rating, 0)
    return Math.round((total / ratings.length) * 10) / 10
  }

  const averageRating = getAverageRating()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Puntuaciones
            </CardTitle>
            <CardDescription>
              {ratings.length} opiniones • Promedio: {averageRating}/5
            </CardDescription>
          </div>
          {!hasUserRated && (
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Puntuar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showAddForm && !hasUserRated && (
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg">Tu puntuación</CardTitle>
              <CardDescription>¿Cómo fue tu experiencia?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puntuación con sushi:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl transition-all duration-200 ${
                          star <= rating ? 'scale-110' : 'scale-100 opacity-50'
                        }`}
                      >
                        {star <= rating ? '🍣' : '⚪'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {rating}/5 sushis - {rating === 1 ? 'Muy malo' : 
                    rating === 2 ? 'Malo' : 
                    rating === 3 ? 'Regular' : 
                    rating === 4 ? 'Bueno' : 'Excelente'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comentario (opcional):</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Enviando..." : "Enviar puntuación"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {ratings.length > 0 ? (
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className={`p-4 rounded-lg border ${
                  rating.playerId === currentUserId 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {rating.playerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{rating.playerName}</p>
                      {rating.playerId === currentUserId && (
                        <Badge variant="secondary" className="text-xs">Tú</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">
                      {getSushiEmojis(rating.rating)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {rating.rating}/5
                    </p>
                  </div>
                </div>
                
                {rating.comment && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Comentario:</span>
                    </div>
                    <p className="text-sm text-gray-600">{rating.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🍣</div>
            <p>No hay puntuaciones aún</p>
            <p className="text-sm">¡Sé el primero en puntuar!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 