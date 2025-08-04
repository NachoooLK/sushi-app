"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAlerts } from "@/hooks/use-alerts"
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  BookOpen, 
  Video, 
  Users,
  Trophy,
  Plus,
  Search
} from "lucide-react"

interface HelpSupportProps {
  onClose: () => void
}

export default function HelpSupport({ onClose }: HelpSupportProps) {
  const [activeTab, setActiveTab] = useState("faq")
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useAlerts()

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simular envío
    setTimeout(() => {
      showSuccess(
        "Mensaje enviado",
        "Te responderemos en las próximas 24 horas"
      )
      setContactForm({ name: "", email: "", subject: "", message: "" })
      setLoading(false)
    }, 1000)
  }

  const faqs = [
    {
      question: "¿Cómo creo una sala?",
      answer: "Ve a la pestaña 'Salas' y haz clic en 'Crear Sala'. Completa el nombre y opcionalmente agrega una foto y ubicación."
    },
    {
      question: "¿Cómo me uno a una sala?",
      answer: "Necesitas el ID de la sala. El creador puede compartirlo contigo, o puedes usar la función 'Unirse a Sala'."
    },
    {
      question: "¿Cómo funciona el modo solitario?",
      answer: "En el modo solitario puedes jugar solo y mejorar tus habilidades. Tus puntuaciones se guardan en tu historial."
    },
    {
      question: "¿Puedo cambiar mi nombre de usuario?",
      answer: "Sí, ve a Ajustes en tu perfil y modifica tu nombre de usuario."
    },
    {
      question: "¿Cómo cambio el tema de la aplicación?",
      answer: "Haz clic en tu avatar y selecciona 'Temas' para elegir entre las diferentes opciones disponibles."
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Ayuda y Soporte
          </CardTitle>
          <CardDescription>
            Encuentra respuestas y obtén ayuda cuando la necesites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: "faq", label: "Preguntas Frecuentes", icon: BookOpen },
              { id: "contact", label: "Contacto", icon: MessageSquare },
              { id: "resources", label: "Recursos", icon: Globe }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Preguntas Frecuentes</h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Contacta con nosotros</h3>
              
              {/* Información de contacto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-gray-600">support@sushirush.app</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Chat</p>
                  <p className="text-xs text-gray-600">24/7 disponible</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Phone className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-xs text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>

              {/* Formulario de contacto */}
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Asunto</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </form>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Recursos útiles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Video className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Tutoriales</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Aprende a usar todas las funciones de Sushi Rush
                  </p>
                  <Button size="sm" variant="outline">Ver tutoriales</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Guías de estrategia</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Mejora tus habilidades y técnicas de juego
                  </p>
                  <Button size="sm" variant="outline">Ver guías</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Comunidad</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Únete a otros jugadores y comparte experiencias
                  </p>
                  <Button size="sm" variant="outline">Unirse</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium">Documentación</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Información técnica y detalles de la aplicación
                  </p>
                  <Button size="sm" variant="outline">Leer docs</Button>
                </div>
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <div className="flex justify-center pt-4">
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 