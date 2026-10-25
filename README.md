# Casa Vértice — experiência 3D cinematográfica

Website de apresentação arquitectónica em que a cena tridimensional é o produto:
uma casa horizontal sobre a costa alentejana, construída em tempo real com
geometria própria, materiais PBR gerados no cliente e iluminação fisicamente
coerente. Não há vídeo, não há renders estáticos, não há mockups.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Three.js ·
React Three Fiber · Drei · GSAP + ScrollTrigger · CSS modular (sem framework de
utilitários, para controlar tipografia e grelha ao pixel).

---

## 1. Como correr

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Parâmetros de QA/presentação:

| Parâmetro    | Efeito                                                              |
| ------------ | ------------------------------------------------------------------- |
| `?q=low`     | força o perfil de qualidade baixo (sem sombras, DPR 1)               |
| `?q=medium`  | força o perfil médio                                                |
| `?q=high`    | força o perfil alto (sombras 2048, DPR até 2)                        |
| `?instant=1` | salta a sequência cinematográfica (útil para capturas ou máquinas fracas) |

---

## 2. O que está efectivamente implementado

### Cena

- Arquitectura modelada em código com **geometria real e dimensões coerentes**
  (13,6 × 9,7 m, pé-direito de 4,30 m, vão de vidro de 11,4 m). Nada de
  primitivas soltas: paredes com vãos recortados, laje com claraboia perfurada,
  palas, pavilhão independente, pérgula de lamelas, espelho de água com
  transbordo, pátio com oliveira, encosta em xisto e mar 27 m abaixo.
- **Materiais PBR gerados por código** (canvas → textura): betão cofrado com
  juntas, buracos de tirante e agregado; carvalho com tábuas, veio e nós;
  travertino com bandas e poros; gravilha; têxteis. Cada material tem
  rugosidade, `bumpMap` e intensidade de ambiente próprias.
- **Iluminação:** sol baixo a oeste-sudoeste (luz principal com sombras suaves
  PCF), preenchimento frio do lado do mar, `hemisphereLight`, ambiente PMREM
  gerado a partir de um céu equirectangular desenhado no cliente e luzes
  práticas quentes no interior. Tone mapping ACES, exposição animada.
- **Composição de câmara** tratada como direcção de arte: cinco vistas
  (Aproximação, Piscina, Terraço, Interior, Implantação), cada uma com distância
  focal, ponto de interesse, limites de órbita e distância própria.

### Interacção 3D

| Requisito                   | Implementação                                                                 |
| --------------------------- | ----------------------------------------------------------------------------- |
| Orbit                       | OrbitControls com amortecimento, limites de azimute/polar por vista            |
| Zoom                        | limites min/max por vista + colisão com a volumetria + `Ctrl`+scroll, `+`/`-` |
| Pan                         | raio máximo do alvo à volta da âncora + limites de cota                        |
| Presets de câmara           | 5 vistas, voos de 1,7 s com `easeInOut`, teclas `1`–`5`                        |
| Selecção de objectos        | raycast R3F sobre grupos seleccionáveis (10 elementos)                          |
| Hotspots                    | projecção mundo→ecrã em DOM, com raycast de oclusão a 8 Hz                      |
| Transições suaves           | interpolação de posição/alvo/FOV num único controlador                          |
| Reset                       | botão no topo, `0`, botão do painel e do colofão                                |
| Focus mode                  | selecção aproxima a câmara ao enquadramento autoral do elemento                 |
| Carregamento progressivo    | loader real (materiais → ambiente → primeiros frames)                           |

A volumetria sólida (`SOLIDS`) e os limites de mundo (`WORLD_BOUNDS`) impedem que
a câmara atravesse paredes ou perca a cena.

### Narrativa cinematográfica

1. **Entrada** — fundo escuro, exposição a 24%, névoa densa.
2. **Construção** — a massa arquitectónica é desenhada como estudo técnico de
   arestas (geometria real, não imagem).
3. **Materialização** — um plano de recorte em espaço de mundo sobe através do
   edifício; os materiais “nascem” do chão, acompanhados por uma linha de
   varrimento aditiva que segue exactamente esse plano.
4. **Apresentação** — a câmara desce de uma vista alta para a composição inicial.
5. **Exploração** — o utilizador assume o controlo (scroll, órbita, selecção).

A introdução dura ~4 s, é dispensável (botão *Saltar introdução*, clique ou
scroll) e respeita `prefers-reduced-motion` (entra directamente na composição
final).

O scroll conduz uma narrativa de câmara em cinco passos (GSAP ScrollTrigger,
`scrub` suave por interpolação exponencial), com capítulos editoriais em
`position: sticky` ancorados ao viewport. O scroll natural nunca é bloqueado.

### Interface

Cromo mínimo sobre a cena: identificação do atelier, título editorial, escala
1:200, leituras de vista/cota, selector de vistas, zoom, reset, ecrã inteiro,
dica de interacção, painel contextual (só com selecção) e indicador de
carregamento. Tipografia Space Grotesk (títulos) + Inter (texto), paleta
`#090B0D / #171A1D / #F3F3EF / #92979D`, com o verde `#B9FF00` reservado a
elementos técnicos (estado activo, contorno de selecção, focos).

### Desempenho e compatibilidade

- Perfis `high` / `medium` / `low` derivados de `hardwareConcurrency`,
  `deviceMemory`, `MAX_TEXTURE_SIZE`, tipo de ponteiro e largura do ecrã.
- Texturas geradas na resolução do perfil (1024/512/256 px) e mantidas em cache.
- Geometria combinada por material (paredes, lajes, pérgula, etc.) para reduzir
  draw calls. Contagem real via `gl.info.render`:
  **perfil baixo — 238 draw calls / 56 288 triângulos**;
  **perfil médio — 378 draw calls / 98 040 triângulos** (o incremento vem das
  sombras e da vegetação de detalhe 2). Geometrias: 221, texturas: 27,
  programas: 19.
- `frameloop="never"` quando o separador está oculto; `AdaptiveDpr` activo.
- Erros tratados: perda de contexto WebGL, falha na preparação de materiais,
  ecrã inteiro indisponível. Sem WebGL, é apresentada uma elevação desenhada e a
  informação do projecto — não se finge que há 3D.
- Não é anunciada nenhuma taxa de frames garantida. O perfil baixo existe
  precisamente porque medir em hardware real é obrigatório.

### Responsivo

Em retrato a câmara afasta-se *e* sobe (enquadramento próprio, não uma coluna
estreita do desktop): o edifício fica no terço médio, a copy editorial em baixo.
Em telemóvel a narrativa manda no ecrã; a exploração 3D entra por um botão
explícito (*Explorar em 3D*), com gestos de órbita/pinça, hotspots reduzidos aos
cinco elementos essenciais e barra de vistas a aparecer só nesse modo.

---

## 3. Arquitectura do código

```
src/
  app/            layout, página, estilos globais (direcção de arte)
  components/
    Site.tsx      orquestração: perfis, fullscreen, teclado, fallback
    scene/
      SceneCanvas.tsx        Canvas R3F, perfil, carregamento, guardas
      MainEnvironment.tsx    casa: fundação, paredes, laje, vidro, terraço, piscina, pavilhão, pérgula
      SceneInterior.tsx      lareira, cozinha, sala, suite, exteriores
      SceneLandscape.tsx     céu shader, terreno, arriba, mar, vegetação, oclusão de contacto
      EnvironmentLighting.tsx sol, preenchimento, ambiente PMREM, práticas
      CameraController.tsx   vistas, voos, narrativa de scroll, colisão, limites
      CinematicSequence.tsx  GSAP: exposição, névoa, recorte de materialização
      SceneHotspots.tsx      projecção dos hotspots (dentro do canvas)
      SelectionFrame.tsx     contorno técnico do objecto seleccionado
      Selectable.tsx         wrapper de selecção
    ui/           Chrome, ViewSelector, SceneInformationPanel, HotspotLabels,
                  SceneLoadingState, Runway (capítulos), Fallback
  lib/
    plan.ts        dimensões e volumetria sólida partilhadas
    camera.ts      vistas, poses, narrativa
    objects.ts     fichas técnicas dos 10 elementos seleccionáveis
    materials.ts   materiais partilhados + plano de recorte
    textures.ts    geração procedural de texturas e céu
    geometry.ts    merge de geometria, árvores, folhagem
    quality.ts     detecção de dispositivo
    store.ts       estado de interface (zustand, fora da árvore R3F)
```

O estado de interface vive fora do React Three Fiber: o ciclo de render lê-o com
`getState()`, pelo que orbitar ou animar a câmara não provoca re-render de
componentes React.

---

## 4. Limites conhecidos (honestos)

- **Não existe modelo GLB/GLTF**: a casa é autorada em código. Foi uma decisão
  consciente — controlo total de geometria, materiais e desempenho, sem assets
  externos nem CDN em runtime. Se o atelier fornecer um GLB real, o caminho de
  integração é `useGLTF` + `SceneCanvas`, mantendo o resto do sistema.
- As texturas são procedurais (canvas), não fotografias digitalizadas: a
  variação existe, mas não tem a riqueza de um scan PBR.
- Reflexos em vidro e água usam ambiente + `MeshPhysicalMaterial`; não há
  reflexão planar em tempo real (custo/benefício desfavorável em WebGL).
- Sem sombras em cascata: uma única luz com sombra, ajustada ao volume da casa.
- As medições de desempenho nesta entrega foram feitas num browser headless com
  renderização por software (SwiftShader). É representativo de draw calls,
  triângulos e memória, **não** de FPS em GPU real.
