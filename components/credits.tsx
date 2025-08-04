"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Code, Coffee, Github, ExternalLink } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function Credits() {
  const { theme, themes } = useTheme()
  const currentTheme = themes.find(t => t.id === theme)

  return (
    <Card className={`${currentTheme?.colors.card} transition-all duration-300`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${currentTheme?.colors.text}`}>
          <span className="text-2xl">🍣</span>
          Créditos
        </CardTitle>
        <CardDescription>Made by NachoLK</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Developer Info */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">NK</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">NachoLK</h3>
                <p className="text-sm text-gray-600">Full Stack Developer</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Code className="mr-1 h-3 w-3" />
              Developer
            </Badge>
          </div>

          {/* Tech Stack */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-1">⚛️</div>
              <div className="text-sm font-medium text-blue-700">React</div>
              <div className="text-xs text-blue-500">Frontend</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-sm font-medium text-green-700">Firebase</div>
              <div className="text-xs text-green-500">Backend</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl mb-1">🎨</div>
              <div className="text-sm font-medium text-orange-700">Tailwind</div>
              <div className="text-xs text-orange-500">Styling</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-1">🍣</div>
              <div className="text-sm font-medium text-purple-700">Sushi</div>
              <div className="text-xs text-purple-500">Inspiration</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex justify-center gap-3 pt-2">
            <a
              href="https://github.com/NachoooLK"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-sm">GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
              <Coffee className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">Powered by Coffee</span>
            </div>
          </div>

          {/* Version */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Sushi Counter v1.0.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Made by NachoLK
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 