import type { CamPose } from "./camera";

export interface SceneSpec {
  label: string;
  value: string;
}

export interface SceneObject {
  id: string;
  num: string;
  /** short hotspot label */
  label: string;
  /** editorial category */
  kicker: string;
  name: string;
  subtitle: string;
  summary: string;
  specs: SceneSpec[];
  /** world anchor for the hotspot */
  anchor: [number, number, number];
  /** art-directed framing used for focus mode */
  focus: CamPose;
}

export const OBJECTS = [
  {
    id: "glass",
    num: "01",
    label: "Plano de vidro",
    kicker: "Envolvente",
    name: "Plano de vidro sul",
    subtitle: "Fachada · vão de 11,4 m",
    summary:
      "A fachada sul dissolve-se num único plano de vidro de 11,4 metros, sem montantes intermédios. O caixilho recolhe para dentro do betão, deixando apenas a linha horizontal do pavimento e a linha da laje: a casa lê-se como um corte no ar. Vidro duplo baixo-emissivo com câmara de árgon, protegido por palas interiores de madeira.",
    specs: [
      { label: "Vão livre", value: "11,4 m" },
      { label: "Vidro", value: "6/16/6 mm" },
      { label: "Caixilharia", value: "Alumínio 42 mm" },
      { label: "Inércia", value: "4 h" },
    ],
    anchor: [1.6, 2.35, 3.42],
    focus: {
      pos: [5.1, 1.85, 6.6],
      target: [4.4, 2.0, 3.4],
      fov: 42,
    },
  },
  {
    id: "floor",
    num: "02",
    label: "Carvalho",
    kicker: "Material",
    name: "Pavimento em carvalho",
    subtitle: "Sala · tábua maciça 190 mm",
    summary:
      "Carvalho português de tábua larga, assente sobre sistema radiante. A madeira foi escovada e oleada duas vezes: absorve a luz das palas e devolve-a ao teto em tons quentes. Na transição para o terraço, o pavimento termina numa soleira de latão com 6 mm de espessura.",
    specs: [
      { label: "Tábua", value: "190 × 2 400 mm" },
      { label: "Acabamento", value: "Óleo duro mate" },
      { label: "Sistema", value: "Radiante hídrico" },
      { label: "Carga", value: "4,2 kN/m²" },
    ],
    anchor: [2.4, 0.16, -0.4],
    focus: {
      pos: [3.6, 1.35, 2.6],
      target: [3.2, 0.16, -1.6],
      fov: 54,
    },
  },
  {
    id: "fireplace",
    num: "03",
    label: "Lareira",
    kicker: "Núcleo",
    name: "Lareira em betão",
    subtitle: "Sala · corpo de 2,40 m",
    summary:
      "Um monólito de betão armado com 2,40 metros ancora o lado nascente da sala. A caixa de fogo é recuada 35 cm, o que deixa a chama quase ao nível do chão. A massa do betão acumula calor durante o dia e devolve-o lentamente à noite.",
    specs: [
      { label: "Corpo", value: "2,40 × 1,10 m" },
      { label: "Recuperador", value: "12 kW" },
      { label: "Inércia", value: "6 h" },
      { label: "Acabamento", value: "Betão aparente" },
    ],
    anchor: [8.9, 1.5, -3.3],
    focus: {
      pos: [5.6, 1.62, -0.9],
      target: [8.95, 1.15, -3.2],
      fov: 44,
    },
  },
  {
    id: "kitchen",
    num: "04",
    label: "Ilha",
    kicker: "Serviço",
    name: "Cozinha e ilha",
    subtitle: "Ala poente · travertino",
    summary:
      "A cozinha recua para poente, encostada à parede de betão, e apresenta-se como um bloco de travertino de 3,20 metros. Os armários altos são em freixo escurecido e desaparecem na sombra da laje; a ilha ilumina-se por baixo, num gesto discreto.",
    specs: [
      { label: "Ilha", value: "3,20 × 1,05 m" },
      { label: "Pedra", value: "Travertino 30 mm" },
      { label: "Frente", value: "Freixo fumado" },
      { label: "Equipamento", value: "Indução 4 zonas" },
    ],
    anchor: [-1.3, 1.1, -3.6],
    focus: {
      pos: [2.4, 1.7, -2.0],
      target: [-1.1, 0.95, -4.2],
      fov: 50,
    },
  },
  {
    id: "suite",
    num: "05",
    label: "Suite",
    kicker: "Programa",
    name: "Suite principal",
    subtitle: "Pavilhão nascente · 26 m²",
    summary:
      "Destacada do corpo principal, a suite é um volume autónomo de 26 m², aberto a norte sobre a encosta. A cabeceira em nogueira funciona como painel acústico; a parede de vidro corre até ao teto e o duche exterior fica a três passos da cama.",
    specs: [
      { label: "Área", value: "26 m²" },
      { label: "Cabeceira", value: "Nogueira maciça" },
      { label: "Vidro", value: "Fixo + oscilobatente" },
      { label: "Clima", value: "Radiante + VMC" },
    ],
    anchor: [13.6, 1.6, -3.1],
    focus: {
      pos: [11.4, 1.72, 0.6],
      target: [14.2, 1.3, -4.5],
      fov: 52,
    },
  },
  {
    id: "pool",
    num: "06",
    label: "Água",
    kicker: "Exterior",
    name: "Espelho de água",
    subtitle: "Terraço · 3,4 × 3,1 m",
    summary:
      "Uma lâmina de água de 45 cm separa a casa do horizonte. O rebordo de transbordo faz desaparecer a borda sul: ao nível dos olhos, a água e o mar alinham-se. À noite, o fundo em basalto escuro transforma o plano num espelho escuro que devolve a fachada iluminada.",
    specs: [
      { label: "Dimensão", value: "3,4 × 3,1 m" },
      { label: "Lâmina", value: "450 mm" },
      { label: "Rebordo", value: "Transbordo total" },
      { label: "Fundo", value: "Basalto escuro" },
    ],
    anchor: [0.05, 0.14, 5.6],
    focus: {
      pos: [0.5, 1.55, 9.6],
      target: [0.3, 0.25, 4.9],
      fov: 48,
    },
  },
  {
    id: "courtyard",
    num: "07",
    label: "Pátio",
    kicker: "Exterior",
    name: "Pátio de entrada",
    subtitle: "Poente · oliveira centenária",
    summary:
      "A entrada faz-se pelo pátio poente, entre a parede de betão e uma oliveira de sessenta anos transplantada do próprio terreno. O chão é de calçada de granito irregular, o único gesto decorativo de todo o projecto.",
    specs: [
      { label: "Área", value: "8,7 × 3,9 m" },
      { label: "Oliveira", value: "60 anos" },
      { label: "Calçada", value: "Granito 60 mm" },
      { label: "Acesso", value: "Pedonal" },
    ],
    anchor: [-3.05, 2.55, 5.4],
    focus: {
      pos: [-8.6, 2.6, 10.4],
      target: [-2.6, 1.5, 4.9],
      fov: 46,
    },
  },
  {
    id: "skylight",
    num: "08",
    label: "Zenital",
    kicker: "Luz",
    name: "Claraboia zenital",
    subtitle: "Núcleo · 2,4 × 2,4 m",
    summary:
      "Uma abertura de 2,4 metros quadrados perfura a laje sobre o núcleo de circulação. A luz entra pelo topo e desenha, ao longo do dia, um trapézio em movimento sobre o betão. A caixa é revestida a estuque de cal e tem ventilação automática.",
    specs: [
      { label: "Dimensão", value: "2,4 × 2,4 m" },
      { label: "Vidro", value: "Laminado 8/8 mm" },
      { label: "Revestimento", value: "Estuque de cal" },
      { label: "Ventilação", value: "Motorizada" },
    ],
    anchor: [4.7, 4.5, -3.3],
    focus: {
      pos: [6.3, 3.05, -0.9],
      target: [4.7, 4.25, -3.3],
      fov: 52,
    },
  },
  {
    id: "pergola",
    num: "09",
    label: "Pérgula",
    kicker: "Estrutura",
    name: "Pérgula do pavilhão",
    subtitle: "Nascente · lamelas de betão",
    summary:
      "Sobre a entrada da suite, sete lamelas de betão pré-fabricado filtram o sol de poente. A sua secção foi calculada para cortar 62% da radiação de Verão sem fechar a vista: uma sombra desenhada, não um toldo.",
    specs: [
      { label: "Vão", value: "6,2 m" },
      { label: "Lamelas", value: "7 × 120 mm" },
      { label: "Sombra", value: "62% (Junho)" },
      { label: "Material", value: "Betão pré-fabricado" },
    ],
    anchor: [13.6, 3.28, 0.95],
    focus: {
      pos: [11.2, 2.55, 5.6],
      target: [14.0, 3.2, 0.7],
      fov: 46,
    },
  },
  {
    id: "coast",
    num: "10",
    label: "Encosta",
    kicker: "Lugar",
    name: "Plataforma costeira",
    subtitle: "Costa alentejana · cota +38 m",
    summary:
      "A casa assenta numa plataforma de xisto a 38 metros acima da linha de água, recuada 60 metros da arriba. A implantação acompanha a curva natural do terreno: nenhuma árvore adulta foi abatida e o volume foi deslocado 3,2 metros para nascente para preservar o sobreiro existente.",
    specs: [
      { label: "Cota", value: "+38 m" },
      { label: "Área de lote", value: "1,2 ha" },
      { label: "Substrato", value: "Xisto" },
      { label: "Recuo à arriba", value: "60 m" },
    ],
    anchor: [-5.5, 0.6, -16.5],
    focus: {
      pos: [9.0, 6.2, -13.5],
      target: [-4.0, 0.6, -22.0],
      fov: 44,
    },
  },
] as const satisfies readonly SceneObject[];

export type SceneObjectId = (typeof OBJECTS)[number]["id"];

export const OBJECT_MAP: Record<string, SceneObject> = Object.fromEntries(
  OBJECTS.map((o) => [o.id, o as SceneObject]),
);

export function getObject(id: string | null): SceneObject | null {
  if (!id) return null;
  return OBJECT_MAP[id] ?? null;
}
