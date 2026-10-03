import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sushi Rush",
    short_name: "Sushi Rush",
    description: "Cuenta cada pieza del libre con tus amigos y descubre quién manda en la mesa.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFAF8",
    theme_color: "#FBFAF8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
