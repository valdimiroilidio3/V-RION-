"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

const SceneTeaser = dynamic(() => import("./scene/SceneTeaser"), { ssr: false });

const FACTS = [
  { label: "Localização", value: "Costa alentejana, Portugal" },
  { label: "Programa", value: "Habitação unifamiliar" },
  { label: "Área bruta", value: "268 m²" },
  { label: "Implantação", value: "13,6 × 9,7 m" },
  { label: "Cota", value: "+38 m sobre o mar" },
  { label: "Ano", value: "2024" },
];

const MATERIALS = [
  {
    swatch: "#b9b6ae",
    name: "Betão aparente",
    note: "Cofragem de tábuas de 20 cm, marcada e não corrigida. A junta é o desenho.",
  },
  {
    swatch: "#c9a273",
    name: "Carvalho escovado",
    note: "Pavimento e carpintaria. Escovado no sentido da entrada de luz.",
  },
  {
    swatch: "#ded3bd",
    name: "Travertino",
    note: "Pavimento exterior, capeamentos e banco da claraboia. Mesma pedra, mesma escala.",
  },
  {
    swatch: "#b08d57",
    name: "Latão escovado",
    note: "Caixilharia, remates e louça. Oxida devagar, sem verniz.",
  },
  {
    swatch: "#8fa5a3",
    name: "Vidro 6 / 16 / 6",
    note: "Onze metros de vão contínuo, sem montante intermédio.",
  },
];

const MEASURES = [
  {
    value: "11,4",
    unit: "m",
    label: "vão livre",
    note: "A fachada sul é uma única folha de vidro. O caixilho recolhe para dentro da laje.",
  },
  {
    value: "3,96",
    unit: "m",
    label: "pé-direito",
    note: "O tecto é a face inferior da laje. Não há tecto falso em toda a área social.",
  },
  {
    value: "3,4 × 3,1",
    unit: "m",
    label: "espelho de água",
    note: "Transbordo a 450 mm. Alinhado com a linha do mar, apaga a borda do terraço.",
  },
];

export default function Landing() {
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setWebgl(Boolean(gl));
    } catch {
      setWebgl(false);
    }
  }, []);

  return (
    <main className="lp">
      <header className="lp__nav">
        <Link className="lp__brand" href="/" aria-label="Casa Vértice, início">
          <span className="lp__brand-mark">V—RION</span>
          <span className="lp__brand-sub">Atelier</span>
        </Link>

        <nav className="lp__links" aria-label="Secções">
          <a href="#projecto">Projecto</a>
          <a href="#materia">Matéria</a>
          <a href="#medidas">Medidas</a>
          <a href="#experiencia">Experiência</a>
        </nav>

        <Link className="lp__cta" href="/experiencia">
          Abrir em 3D
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" />
          </svg>
        </Link>
      </header>

      <section className="lp-hero">
        <div className="lp-hero__inner">
          <div className="lp-hero__eyebrow">
            <i aria-hidden="true" />
            Habitação unifamiliar · 2024
          </div>

          <h1 className="lp-hero__title">
            Casa
            <br />
            <em>Vértice</em>
          </h1>

          <div className="lp-hero__tail">
            <p className="lp-hero__lede">
              Um plano horizontal de betão e vidro, assente a trinta e oito metros
              sobre o Atlântico. A casa não se vira para a paisagem — enquadra-a.
            </p>

            <div className="lp-hero__actions">
              <Link className="lp-button" href="/experiencia">
                Entrar na experiência 3D
              </Link>
              <a className="lp-link" href="#projecto">
                Ler o projecto
              </a>
            </div>
          </div>

          <dl className="lp-hero__meta">
            <div>
              <dt>Área</dt>
              <dd>268 m²</dd>
            </div>
            <div>
              <dt>Implantação</dt>
              <dd>13,6 × 9,7 m</dd>
            </div>
            <div>
              <dt>Vão livre</dt>
              <dd>11,4 m</dd>
            </div>
          </dl>
        </div>
      </section>

      <figure className="lp-figure">
        <div className="lp-figure__stage">
          {webgl === false ? (
            <div className="lp-figure__offline">
              <span>Elevação sul · desenho</span>
              <svg viewBox="0 0 640 220" role="img" aria-label="Elevação sul da Casa Vértice">
                <line x1="40" y1="170" x2="600" y2="170" stroke="#92979D" strokeWidth="0.8" />
                <rect x="110" y="78" width="440" height="14" fill="none" stroke="#F3F3EF" strokeWidth="1.2" />
                <rect x="110" y="92" width="440" height="78" fill="none" stroke="#92979D" strokeWidth="0.7" />
                <line x1="290" y1="92" x2="290" y2="170" stroke="#92979D" strokeWidth="0.5" strokeDasharray="3 5" />
                <line x1="420" y1="92" x2="420" y2="170" stroke="#92979D" strokeWidth="0.5" strokeDasharray="3 5" />
                <text x="110" y="196" fill="#92979D" fontSize="9" letterSpacing="2">
                  ELEVAÇÃO SUL · 1:200
                </text>
                <text x="530" y="196" fill="#B9FF00" fontSize="9" letterSpacing="2">
                  +38 M
                </text>
              </svg>
            </div>
          ) : webgl ? (
            <SceneTeaser />
          ) : (
            <div className="teaser__pending" aria-hidden="true" />
          )}

          <div className="lp-figure__tag">
            <span className="lp-figure__dot" aria-hidden="true" />
            {webgl === false ? "WebGL indisponível" : "Cena em tempo real · WebGL"}
          </div>
        </div>

        <figcaption className="lp-figure__caption">
          <span>
            Vista de aproximação a partir de sudoeste. Geometria, materiais e luz
            são calculados no dispositivo — não há vídeo nem imagem pré-renderizada.
          </span>
          <Link className="lp-link" href="/experiencia">
            Abrir a cena completa
          </Link>
        </figcaption>
      </figure>

      <section className="lp-section" id="projecto">
        <div className="lp-section__label">
          <span>01</span>
          <h2>O projecto</h2>
        </div>

        <div className="lp-section__body">
          <p className="lp-section__lead">
            A Casa Vértice é um único volume horizontal pousado na plataforma de
            xisto da costa alentejana. Tudo o que a define cabe em três decisões:
            uma laje que protege, um vão que desaparece e um chão que se prolonga
            para fora.
          </p>
          <div className="lp-columns">
            <p>
              A laje de cobertura avança 1,2 metros sobre a fachada sul e resolve,
              sozinha, o ensombramento de toda a área social. Por baixo dela, a
              fachada não tem colunas visíveis: o vão de 11,4 metros é fechado por
              caixilharia de alumínio de 42 mm, recolhida no interior da laje.
            </p>
            <p>
              O pavimento de travertino continua do interior para o terraço sem
              degrau e sem mudança de material. A piscina de transbordo alinha com
              a linha do mar; ao nível dos olhos, os dois planos de água
              confundem-se e a casa perde a sua borda sul.
            </p>
            <p>
              O programa divide-se em duas metades: a oeste, a área social e a
              cozinha, abertas ao terraço; a leste, o pavilhão da suíte, recuado
              sob uma pérgula de lâminas de madeira que filtra a luz do poente.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-section" id="ficha">
        <div className="lp-section__label">
          <span>02</span>
          <h2>Ficha</h2>
        </div>
        <div className="lp-section__body">
          <dl className="lp-facts">
            {FACTS.map((fact) => (
              <div className="lp-facts__cell" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="lp-section" id="materia">
        <div className="lp-section__label">
          <span>03</span>
          <h2>Matéria</h2>
        </div>
        <div className="lp-section__body">
          <p className="lp-section__lead">
            Cinco materiais, sem excepção e sem revestimento decorativo. Cada um
            aparece na cena 3D com a mesma paleta e a mesma rugosidade que aqui se
            descreve.
          </p>
          <ul className="lp-materials">
            {MATERIALS.map((material) => (
              <li key={material.name}>
                <span
                  className="lp-materials__swatch"
                  style={{ background: material.swatch }}
                  aria-hidden="true"
                />
                <span className="lp-materials__name">{material.name}</span>
                <span className="lp-materials__note">{material.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-section" id="medidas">
        <div className="lp-section__label">
          <span>04</span>
          <h2>Medidas</h2>
        </div>
        <div className="lp-section__body">
          <div className="lp-measures">
            {MEASURES.map((measure) => (
              <div className="lp-measure" key={measure.label}>
                <div className="lp-measure__value">
                  {measure.value}
                  <span>{measure.unit}</span>
                </div>
                <div className="lp-measure__label">{measure.label}</div>
                <p className="lp-measure__note">{measure.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--last" id="experiencia">
        <div className="lp-section__label">
          <span>05</span>
          <h2>Experiência</h2>
        </div>
        <div className="lp-section__body">
          <p className="lp-section__lead">
            A segunda parte do projecto é a própria casa, em tempo real. Não é um
            vídeo: é a geometria, os materiais e a luz, calculados enquanto a
            percorres.
          </p>

          <div className="lp-columns">
            <p>
              Cinco vistas fixas — aproximação, espelho de água, terraço, interior
              e implantação — com uma câmara que nunca atravessa paredes nem sai
              dos limites definidos. Órbita com restrições, zoom e deslocamento
              contidos.
            </p>
            <p>
              Cada elemento da casa pode ser seleccionado para ler a sua ficha
              técnica: material, dimensão, função. A leitura de óptica no topo
              indica a distância da câmara e a distância focal equivalente em full
              frame, actualizada a cada movimento.
            </p>
            <p>
              O carregamento é progressivo e o perfil gráfico adapta-se ao
              dispositivo. Não prometemos uma taxa de frames: mostramos o custo
              real da cena — malhas, triângulos e draw calls — e deixamos o
              dispositivo decidir.
            </p>
          </div>

          <div className="lp-experience">
            <Link className="lp-button lp-button--solid" href="/experiencia">
              Entrar na experiência 3D
            </Link>
            <span className="lp-experience__note">
              Requer WebGL · recomenda-se rato ou ecrã táctil · a narrativa
              cinematográfica dura nove segundos e pode ser saltada
            </span>
          </div>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-foot__brand">
          <span className="lp__brand-mark">V—RION</span>
          <span>Casa Vértice · Costa alentejana · 2024</span>
        </div>
        <div className="lp-foot__meta">
          <span>Estudo arquitectónico</span>
          <span>Space Grotesk &amp; Inter</span>
          <span>Imagens geradas em tempo real</span>
        </div>
        <Link className="lp-link" href="/experiencia">
          Abrir em 3D
        </Link>
      </footer>
    </main>
  );
}
