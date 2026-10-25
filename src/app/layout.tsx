import type { Metadata, Viewport } from "next";
import "@fontsource/space-grotesk/300.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa Vértice — V-RION Atelier",
  description:
    "Uma casa horizontal sobre a costa alentejana. Experiência arquitectónica tridimensional interactiva: betão aparente, vidro, carvalho e água.",
  openGraph: {
    title: "Casa Vértice — V-RION Atelier",
    description:
      "Uma casa horizontal sobre a costa alentejana. Experiência arquitectónica tridimensional interactiva.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#090B0D",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
