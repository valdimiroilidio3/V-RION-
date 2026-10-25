"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUI } from "@/lib/store";
import { cameraBridge } from "@/lib/cameraBridge";

interface Chapter {
  index: string;
  title: string;
  text: string;
  facts: { label: string; value: string }[];
}

const CHAPTERS: Chapter[] = [
  {
    index: "01 / 05",
    title: "A casa e o horizonte",
    text: "Um plano horizontal de 13,6 metros assenta na plataforma de xisto e desmaterializa-se em vidro. A cobertura protege, o pavimento prolonga-se em travertino e a água alinha a casa com a linha do mar.",
    facts: [
      { label: "Área bruta", value: "268 m²" },
      { label: "Implantação", value: "13,6 × 9,7 m" },
      { label: "Cota", value: "+38 m" },
    ],
  },
  {
    index: "02 / 05",
    title: "Um corte no ar",
    text: "A fachada sul é um único vão de 11,4 metros, sem montantes intermédios. O caixilho recolhe para dentro da laje, deixa apenas duas linhas horizontais e devolve o edifício à sua leitura mais elementar.",
    facts: [
      { label: "Vão livre", value: "11,4 m" },
      { label: "Vidro", value: "6 / 16 / 6 mm" },
      { label: "Caixilharia", value: "Alumínio 42 mm" },
    ],
  },
  {
    index: "03 / 05",
    title: "Matéria e sombra",
    text: "Betão aparente marcado pela cofragem, carvalho escovado, travertino e latão. A luz rasante do poente atravessa a pérgula e desenha sobre o betão um relevo que muda de hora a hora.",
    facts: [
      { label: "Betão", value: "Aparente, cofrado" },
      { label: "Madeira", value: "Carvalho nacional" },
      { label: "Pedra", value: "Travertino romano" },
    ],
  },
  {
    index: "04 / 05",
    title: "A água como pavimento",
    text: "O espelho de água de transbordo apaga a borda sul do terraço. Ao nível dos olhos, o plano da água e o plano do mar confundem-se: a casa deixa de ter um limite visível.",
    facts: [
      { label: "Lâmina de água", value: "3,4 × 3,1 m" },
      { label: "Profundidade", value: "450 mm" },
      { label: "Fundo", value: "Basalto escuro" },
    ],
  },
];

export function Runway() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(() => CHAPTERS.map(() => false));

  useEffect(() => {
    if (!runwayRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const narrativeTrigger = ScrollTrigger.create({
      trigger: runwayRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        useUI.getState().setNarrative(self.progress);
      },
      onRefresh: (self) => {
        useUI.getState().setNarrative(self.progress);
      },
    });

    const chapterTriggers = chapterRefs.current
      .filter((element): element is HTMLDivElement => Boolean(element))
      .map((element, index) =>
        ScrollTrigger.create({
          trigger: element,
          start: "top 72%",
          end: "bottom 26%",
          onToggle: (self) => {
            setVisible((previous) => {
              if (previous[index] === self.isActive) return previous;
              const next = [...previous];
              next[index] = self.isActive;
              return next;
            });
          },
        }),
      );

    return () => {
      narrativeTrigger.kill();
      chapterTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="runway" ref={runwayRef}>
      <section className="runway__section runway__section--hero" aria-hidden="true" />

      {CHAPTERS.map((chapter, index) => (
        <section className="runway__section" key={chapter.index}>
          <div className="runway__sticky">
            <div
              className="chapter"
              data-visible={visible[index]}
              ref={(node) => {
                chapterRefs.current[index] = node;
              }}
            >
              <div className="chapter__index">{chapter.index}</div>
              <h2 className="chapter__title">{chapter.title}</h2>
              <p className="chapter__text">{chapter.text}</p>
              <ul className="chapter__facts">
                {chapter.facts.map((fact) => (
                  <li key={fact.label}>
                    {fact.label}
                    <b>{fact.value}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <section className="runway__section runway__section--end">
        <div className="colophon">
          <div>
            <div className="chapter__index">05 / 05</div>
            <h2 className="colophon__title">A cena continua a tua.</h2>
            <p className="chapter__text">
              Arrasta para orbitar, aproxima com o zoom ou escolhe uma vista. Selecciona
              qualquer elemento da casa para ler a sua ficha técnica, e volta à composição
              inicial quando quiseres.
            </p>
          </div>

          <dl className="colophon__grid">
            <div className="colophon__cell">
              <dt>Projecto</dt>
              <dd>Casa Vértice · habitação unifamiliar</dd>
            </div>
            <div className="colophon__cell">
              <dt>Localização</dt>
              <dd>Costa alentejana, Portugal</dd>
            </div>
            <div className="colophon__cell">
              <dt>Área</dt>
              <dd>268 m² · lote 1,2 ha</dd>
            </div>
            <div className="colophon__cell">
              <dt>Ano</dt>
              <dd>2024</dd>
            </div>
            <div className="colophon__cell">
              <dt>Estrutura</dt>
              <dd>Betão armado, laje maciça</dd>
            </div>
            <div className="colophon__cell">
              <dt>Visualização</dt>
              <dd>WebGL em tempo real · sem vídeo</dd>
            </div>
          </dl>

          <div className="colophon__actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => cameraBridge.reset()}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M1 6a5 5 0 1 0 1.5-3.5M1 1v4h4" />
              </svg>
              Repor vista inicial
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                useUI.getState().setView("aerial");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M1 2.5L6 6l5-3.5M1 9.5L6 6l5 3.5" />
              </svg>
              Ver implantação
            </button>
            {/* the document and the scene are two pages: this is the way back */}
            <Link className="ghost-button" href="/">
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M10 6H2M5.5 2.5L2 6l3.5 3.5" />
              </svg>
              Página do projecto
            </Link>
          </div>

          <div className="colophon__foot">
            <span>© V-RION Atelier · 2024</span>
            <span>Space Grotesk &amp; Inter</span>
            <span>Estudo arquitectónico · imagens geradas em tempo real</span>
          </div>
        </div>
      </section>
    </div>
  );
}
