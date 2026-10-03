import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sushi Rush",
    short_name: "Sushi Rush",
    description: "Cuenta cada pieza del libre de sushi con tus amigos, con ranking en directo.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e9",
    theme_color: "#ec5a37",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
