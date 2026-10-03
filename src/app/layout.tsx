import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display-face" })
const body = Inter({ subsets: ["latin"], variable: "--font-body" })

export const metadata: Metadata = {
  title: { default: "Sushi Rush", template: "%s · Sushi Rush" },
  description: "Cuenta cada pieza del libre de sushi con tus amigos, con ranking en directo.",
  applicationName: "Sushi Rush",
  appleWebApp: { capable: true, title: "Sushi Rush", statusBarStyle: "default" },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e9" },
    { media: "(prefers-color-scheme: dark)", color: "#110e0d" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
