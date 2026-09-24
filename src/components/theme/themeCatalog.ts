export interface ThemeOption {
  id: string;
  name: string;
  genre: string;
  category: "literary" | "genre" | "neutral" | "mood";
  description: string;
  isDark: boolean;
  allowsCustomAccent: boolean;
  palette: {
    bgMain: string;
    bgSurface: string;
    bgCard: string;
    border: string;
    textMain: string;
    textBody: string;
    textMuted: string;
    defaultAccent: string;
  };
}

export const THEME_CATALOG: ThemeOption[] = [
  {
    id: "minimal",
    name: "Claro Editorial",
    genre: "Minimalismo & Ensayo",
    category: "literary",
    description:
      "Lienzo blanco marfil neutro de máxima claridad tipográfica. Libre de distracciones para escribir con pulcritud y enfoque absoluto.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#F9F9F7",
      bgSurface: "#F3F3F0",
      bgCard: "#FCFCFA",
      border: "rgba(0, 0, 0, 0.06)",
      textMain: "#18181B",
      textBody: "#3F3F46",
      textMuted: "#71717A",
      defaultAccent: "#18181B",
    },
  },
  {
    id: "dark",
    name: "Carbón Nocturno",
    genre: "Descanso Ocular & Noche",
    category: "literary",
    description:
      "Superficie carbón mate profunda sin reflejos agresivos. Diseñada para proteger la vista en sesiones prolongadas de escritura nocturna.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#101012",
      bgSurface: "#161619",
      bgCard: "#141416",
      border: "rgba(255, 255, 255, 0.07)",
      textMain: "#F4F4F6",
      textBody: "#D1D1DB",
      textMuted: "#8E8E9B",
      defaultAccent: "#E5A93C",
    },
  },
  {
    id: "sepia",
    name: "Pergamino Fantasía",
    genre: "Fantasía Épica & Crónicas",
    category: "literary",
    description:
      "Tonalidad cálida de papel añejo y tinta nogalina. Conecta con la atmósfera de bibliotecas medievales, mapas y reinos legendarios.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#F4ECE0",
      bgSurface: "#EEE4D4",
      bgCard: "#F8F3EA",
      border: "rgba(80, 50, 20, 0.08)",
      textMain: "#2A1B10",
      textBody: "#493322",
      textMuted: "#7E644D",
      defaultAccent: "#92400E",
    },
  },
  {
    id: "forest",
    name: "Bosque Brumoso",
    genre: "Aventura, Naturaleza & Realismo",
    category: "literary",
    description:
      "Verde pino profundo y niebla botánica serena. Evoca caminatas entre senderos húmedos, cabañas lejanas y una calma inmersiva.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#0A130F",
      bgSurface: "#101D17",
      bgCard: "#0D1813",
      border: "rgba(255, 255, 255, 0.07)",
      textMain: "#ECFDF5",
      textBody: "#D1FAE5",
      textMuted: "#6EE7B7",
      defaultAccent: "#10B981",
    },
  },
  {
    id: "midnight",
    name: "Medianoche",
    genre: "Thriller, Espionaje & Tensión",
    category: "literary",
    description:
      "Azul marino abisal de baja saturación con acentos cian tenues. Proyecta concentración rigurosa y misterio nocturno.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#090D18",
      bgSurface: "#101626",
      bgCard: "#0C1220",
      border: "rgba(255, 255, 255, 0.07)",
      textMain: "#F0F4FF",
      textBody: "#C7D2FE",
      textMuted: "#818CF8",
      defaultAccent: "#38BDF8",
    },
  },
  {
    id: "noir",
    name: "Noir Monocromo",
    genre: "Policiaco, Intriga & Misterio",
    category: "literary",
    description:
      "Claroscuro cinematográfico en escala de grises pura. Alto contraste monocromático con un destello carmesí de peligro.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#0E0E10",
      bgSurface: "#141416",
      bgCard: "#111113",
      border: "rgba(255, 255, 255, 0.07)",
      textMain: "#F4F4F5",
      textBody: "#D4D4D8",
      textMuted: "#A1A1AA",
      defaultAccent: "#E11D48",
    },
  },
  {
    id: "scifi",
    name: "Ciencia Ficción",
    genre: "Cyberpunk & Distopía Espacial",
    category: "genre",
    description:
      "Gris obsidiana metálico con acentos cian eléctrico y neón azul. Evoca interfaces de naves interestelares y futuros lejanos.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#090C12",
      bgSurface: "#0F1522",
      bgCard: "#0C111A",
      border: "rgba(56, 189, 248, 0.12)",
      textMain: "#E0F2FE",
      textBody: "#BAE6FD",
      textMuted: "#38BDF8",
      defaultAccent: "#00D8F6",
    },
  },
  {
    id: "gothic",
    name: "Terror & Gótico",
    genre: "Horror, Suspense & Mansiones",
    category: "genre",
    description:
      "Sombras lúgubres de cripta y terciopelo borgoña envejecido. Ideal para sumergirse en relatos de suspense ominoso y pesadillas victorianas.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#10080B",
      bgSurface: "#170D12",
      bgCard: "#130A0E",
      border: "rgba(190, 24, 93, 0.14)",
      textMain: "#FDE8EF",
      textBody: "#E7B8C8",
      textMuted: "#9D6379",
      defaultAccent: "#BE185D",
    },
  },
  {
    id: "romance",
    name: "Romance & Drama",
    genre: "Lírica, Recuerdos & Sentimental",
    category: "genre",
    description:
      "Matices melocotón empolvado, rosa cálido y suavidad crepuscular. Transmite intimidad emocional y belleza poética.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#FFF3F0",
      bgSurface: "#FCEBE6",
      bgCard: "#FFF8F6",
      border: "rgba(225, 29, 72, 0.08)",
      textMain: "#331A1D",
      textBody: "#5A353A",
      textMuted: "#96676E",
      defaultAccent: "#E11D48",
    },
  },
  {
    id: "dream",
    name: "Lavanda Onírica",
    genre: "Realismo Mágico & Ensueño",
    category: "genre",
    description:
      "Púrpura amatista crepuscular con destellos violeta etéreos. Para historias donde la frontera entre vigilia y sueño se disuelve.",
    isDark: true,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#100E1A",
      bgSurface: "#171424",
      bgCard: "#13111E",
      border: "rgba(168, 85, 247, 0.12)",
      textMain: "#F5F0FF",
      textBody: "#D8CEF6",
      textMuted: "#9588BA",
      defaultAccent: "#A855F7",
    },
  },
  {
    id: "light",
    name: "Luz Nórdica",
    genre: "Filosofía & Claridad Ártica",
    category: "genre",
    description:
      "Claridad escandinava con sutiles matices azul pálido y acento cobalto. Inspirada en la luz fría de las mañanas boreales.",
    isDark: false,
    allowsCustomAccent: true,
    palette: {
      bgMain: "#F4F7FB",
      bgSurface: "#EAF0F8",
      bgCard: "#F9FBFE",
      border: "rgba(0, 0, 0, 0.06)",
      textMain: "#0F172A",
      textBody: "#334155",
      textMuted: "#64748B",
      defaultAccent: "#2563EB",
    },
  },
];

export const ACCENT_PRESETS = [
  { name: "Blanco Puro", color: "#FFFFFF" },
  { name: "Tinta Pura", color: "#18181B" },
  { name: "Titanio / Grafito", color: "#71717A" },
  { name: "Ámbar Dorado", color: "#E5A93C" },
  { name: "Azul Cobalto", color: "#2563EB" },
  { name: "Esmeralda Viva", color: "#10B981" },
  { name: "Carmesí Rubí", color: "#E11D48" },
  { name: "Púrpura Imperial", color: "#8B5CF6" },
  { name: "Cobre Terracota", color: "#EA580C" },
  { name: "Cian Neón", color: "#00D8F6" },
  { name: "Rosa Vibrante", color: "#EC4899" },
];
