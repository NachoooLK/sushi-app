import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: { default: "Sushi Rush", template: "%s · Sushi Rush" },
  description: "Cuenta cada pieza del libre con tus amigos y descubre quién manda en la mesa.",
  applicationName: "Sushi Rush",
  appleWebApp: { capable: true, title: "Sushi Rush", statusBarStyle: "default" },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0E" },
  ],
}

// Aplica la clase `dark` antes del primer pintado para que no parpadee, y sigue los cambios del sistema.
const themeScript = `(function(){var m=window.matchMedia("(prefers-color-scheme: dark)");function a(){document.documentElement.classList.toggle("dark",m.matches)}a();m.addEventListener("change",a)})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans text-body text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
