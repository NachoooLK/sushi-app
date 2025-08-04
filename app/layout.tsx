import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: '🍣 Sushi Rush',
  description: 'Contador de sushi en tiempo real con amigos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-2 text-center z-50">
                  <p className="text-xs text-gray-500">
          Made by <a href="https://github.com/NachoooLK" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">NachoLK</a>
        </p>
        </footer>
      </body>
    </html>
  )
}
