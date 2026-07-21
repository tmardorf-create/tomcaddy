import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TomCaddy",
    short_name: "TomCaddy",
    description: "Dein digitaler Golf-Caddy",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7f2",
    theme_color: "#1f5135",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
