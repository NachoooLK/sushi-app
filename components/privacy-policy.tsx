"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, Database, Users, Calendar } from "lucide-react"

interface PrivacyPolicyProps {
  onClose: () => void
}

export default function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Política de Privacidad
          </CardTitle>
          <CardDescription>
            Cómo protegemos y utilizamos tu información
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información que recopilamos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Información que recopilamos
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Información de cuenta:</strong> Email, nombre de usuario</p>
              <p>• <strong>Datos de juego:</strong> Puntuaciones, estadísticas, historial</p>
              <p>• <strong>Información técnica:</strong> Dispositivo, navegador, IP</p>
            </div>
          </div>

          {/* Cómo usamos la información */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cómo usamos tu información
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Funcionalidad:</strong> Para proporcionar el servicio de juego</p>
              <p>• <strong>Mejoras:</strong> Para mejorar la experiencia de usuario</p>
              <p>• <strong>Seguridad:</strong> Para proteger tu cuenta y datos</p>
              <p>• <strong>Comunicación:</strong> Para notificaciones importantes</p>
            </div>
          </div>

          {/* Almacenamiento */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Almacenamiento y seguridad
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Encriptación:</strong> Todos los datos están encriptados</p>
              <p>• <strong>Firebase:</strong> Utilizamos servicios seguros de Google</p>
              <p>• <strong>Acceso limitado:</strong> Solo personal autorizado</p>
              <p>• <strong>Backup:</strong> Copias de seguridad regulares</p>
            </div>
          </div>

          {/* Tus derechos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Tus derechos
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Acceso:</strong> Ver qué datos tenemos sobre ti</p>
              <p>• <strong>Rectificación:</strong> Corregir información incorrecta</p>
              <p>• <strong>Eliminación:</strong> Solicitar borrado de datos</p>
              <p>• <strong>Portabilidad:</strong> Exportar tus datos</p>
            </div>
          </div>

          {/* Retención */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Retención de datos
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Cuenta activa:</strong> Mientras uses la aplicación</p>
              <p>• <strong>Cuenta inactiva:</strong> 2 años después del último uso</p>
              <p>• <strong>Eliminación:</strong> 30 días después de la solicitud</p>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">¿Tienes preguntas?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Si tienes alguna pregunta sobre esta política de privacidad, 
              contáctanos en:
            </p>
            <div className="space-y-1 text-sm">
              <p>📧 <strong>Email:</strong> privacy@sushirush.app</p>
              <p>🌐 <strong>Web:</strong> sushirush.app/privacy</p>
            </div>
          </div>

          {/* Versión */}
          <div className="text-center pt-4">
            <Badge variant="outline" className="text-xs">
              Versión 1.0 - Última actualización: {new Date().toLocaleDateString()}
            </Badge>
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-center pt-4">
            <Button onClick={onClose} className="px-8">
              Entendido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 