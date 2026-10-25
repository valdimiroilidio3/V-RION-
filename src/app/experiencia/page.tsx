import type { Metadata } from "next";
import Site from "@/components/Site";

export const metadata: Metadata = {
  title: "Casa Vértice — experiência 3D · V-RION Atelier",
  description:
    "A Casa Vértice em tempo real: geometria, materiais e luz calculados no dispositivo. Cinco vistas, órbita contida e ficha técnica por elemento.",
};

export default function Page() {
  return <Site />;
}
