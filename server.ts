import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini initialization with lazy check
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Writing Assistant AI Endpoint
app.post("/api/ai/assist", async (req, res) => {
  const { action, text, context, customPrompt, tone, pov, characters } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      error: "La clave GEMINI_API_KEY no está configurada en los secretos de la aplicación.",
    });
  }

  let systemInstruction = `Eres "Musa Novelística", un editor literario y consultor de narrativa de ficción de nivel profesional, especializado en literatura en español y técnicas de storytelling aplicadas (Scrivener, Novelcrafter).
Tu objetivo es ayudar al autor a enriquecer su prosa, pulir diálogos con la puntuación canónica del español (guión largo raya '—', sin espacios pegado al parlamento, correcta puntuación en acotaciones), mejorar el "Mostrar, no decir" (Show, don't tell), y mantener la coherencia narrativa del mundo y personajes.`;

  let prompt = "";

  switch (action) {
    case "dialogue-format":
      prompt = `Aplica las reglas formales de la RAE para diálogos narrativos en español con raya o guion largo ('—') al siguiente texto.
Reglas clave:
1. Iniciar el parlamento con raya pegada a la primera palabra: '—Hola'.
2. Si hay acotación del narrador con verbo dicendi (dijo, murmuró, exclamó), la raya va pegada al verbo y en minúscula: '—Hola —dijo él.'.
3. Si la acotación no tiene verbo dicendi, el parlamento cierra con punto y la acotación inicia con mayúscula: '—Cállate. —Se levantó de golpe.'.
4. Cierre correcto al reanudar el diálogo.

Texto a formatear:
"""${text}"""

Devuelve únicamente el texto corregido y formateado en español con sus saltos de párrafo naturales.`;
      break;

    case "show-dont-tell":
      prompt = `Transforma el siguiente pasaje narrativo aplicando la técnica literaria "Mostrar, no contar" (Show, Don't Tell).
Reemplaza explicaciones abstractas por sensaciones físicas, micro-gestos, atmósfera, subtexto y reacciones fisiológicas concretas. Mantén la voz narrativa y el tono (${tone || "literario"}).

Pasaje original:
"""${text}"""

Contexto de la escena: ${context || "N/A"}
Punto de vista (POV): ${pov || "No especificado"}

Proporciona:
1. Versión reescrita pulida y cinematográfica.
2. Breve nota explicativa (2-3 líneas) de los resortes sensoriales aplicados.`;
      break;

    case "sensory-enrich":
      prompt = `Enriquece el siguiente fragmento añadiendo texturas sensoriales vívidas (olores, sonidos sutiles, temperatura, juegos de luz y sombra, sensaciones táctiles) sin sobrecargar la prosa.

Texto:
"""${text}"""
Atmósfera deseada: ${tone || "Inmersiva y detallada"}

Devuelve el fragmento enriquecido de manera fluida y bella.`;
      break;

    case "continue-scene":
      prompt = `Continúa de forma orgánica y cautivadora la siguiente escena novelística.
Últimas líneas del texto:
"""${text}"""

Contexto y objetivo de la escena: ${context || "Avanzar el conflicto"}
Personajes presentes: ${characters || "Personajes de la escena"}
Punto de vista: ${pov || "Tercera persona"}
Tono: ${tone || "Dramático"}

Escribe 2 a 3 párrafos de continuación que eleven la tensión, muestren subtexto o revelen un detalle intrigante.`;
      break;

    case "brainstorm-twists":
      prompt = `Actúa como maestro de trama. Con base en este contexto de escena o capítulo:
"""${context || text}"""

Genera 4 ideas originales y sorprendentes pero lógicamente coherentes:
1. Un giro inesperado sobre las intenciones de un personaje.
2. Un obstáculo ambiental o complicación inmediata.
3. Un dilema moral o secreto a punto de revelarse.
4. Una conexión con el lore o una subtrama paralela.`;
      break;

    case "critique-pacing":
      prompt = `Analiza críticamente el siguiente extracto novelístico:
"""${text}"""

Evalúa con precisión constructiva:
- Ritmo narrativo y tensión.
- Naturalidad de los diálogos y voz de los personajes.
- Claridad sensorial y visual.
- 1 sugerencia de mejora de alto impacto.`;
      break;

    case "custom":
    default:
      prompt = `El autor te hace la siguiente consulta creativa:
"${customPrompt || text}"

Contexto del proyecto/manuscrito:
${context || "N/A"}

Personajes relevantes: ${characters || "N/A"}

Responde con perspicacia editorial, ejemplos concretos y tono profesional y alentador.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const output = response.text || "";
    res.json({ result: output });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: error?.message || "Error al procesar la solicitud con Gemini AI",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Novelist server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
