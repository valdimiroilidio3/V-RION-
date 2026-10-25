import type { Metadata } from "next";
import Landing from "@/components/Landing";

export const metadata: Metadata = {
  title: "Casa Vértice — V-RION Atelier",
  description:
    "Habitação unifamiliar na costa alentejana. 268 m², vão livre de 11,4 m, betão aparente, travertino e vidro. Ficha, matéria e acesso à experiência 3D em tempo real.",
};

export default function Page() {
  return <Landing />;
}
