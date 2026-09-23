# Novelore

**Novelore** es una suite de software de escritorio **local-first** diseñada para escritores, novelistas y creadores de mundos (*worldbuilders*). Proporciona un entorno unificado que combina redacción literaria sin distracciones, estructuración dramática, biblias de *worldbuilding* (Códice), cronologías multilínea, mapas visuales de relaciones, pizarras de inspiración y maquetación editorial.

---

## Principio Rector: Tus Palabras te Pertenecen (Local-First)

Novelore opera bajo una filosofía estricta de **soberanía de datos**:
- **Sin servidores propietarios ni dependencias en la nube**: Toda la aplicación funciona al 100% de forma autónoma y sin conexión a internet (*offline-first*).
- **Carpeta de Proyecto Transparente**: Cada novela se guarda como una carpeta estándar en tu ordenador (en la ubicación que tú elijas).
- **Prosa en Markdown Puro (`.md`)**: Cada escena se almacena como un archivo de texto independiente. Si dentro de años abres esa carpeta en cualquier visor o sistema operativo, todos tus manuscritos seguirán siendo legibles e intactos.
- **Metadatos en JSON Abierto**: Las fichas del códex, la planificación y las notas residen en archivos JSON limpios (`project.json`, `manuscript.json`, `codex.json`, `planning.json`).
- **Recursos Físicos Locales**: Toda imagen, portada, fuente tipográfica personalizada o documento PDF adjunto se copia dentro de la subcarpeta local `/assets/`, haciendo que cada proyecto sea 100% portable y autónomo.
- **Sincronización Personal**: Puedes ubicar la carpeta de tu novela en cualquier servicio de almacenamiento en la nube personal que utilices (**Google Drive, Dropbox, Microsoft OneDrive, Syncthing, Git**, etc.) para sincronizarla entre dispositivos de forma instantánea y segura.

---

## Características Principales

- **Editor de Manuscrito Literario**:
  - Estructuración jerárquica en Actos, Capítulos y Escenas con reordenación fluida y cálculo de progreso.
  - Prosa almacenada en archivos Markdown limpios por escena.
  - Modo Zen (pantalla completa) y modo máquina de escribir (*typewriter scrolling*).
  - Formateo inteligente de diálogos en español según las reglas canónicas de la RAE (raya larga `—`, espaciados e incisos de verbos *dicendi*).
  - Inserción de comillas latinas/angulares (`« »`) y marcas de corte de escena (`* * *`).
  - Historial profundo de Deshacer / Rehacer (*Undo/Redo*) con atajos estándar (`Ctrl+Z`, `Ctrl+Y`).
  - Soporte para fuentes tipográficas personalizadas (`.ttf`, `.otf`, `.woff`) cargadas en local.

- **Inspector de Escenas**:
  - Ficha dramática por escena: Objetivo del personaje POV, Conflicto y Resultado/Giro.
  - Asignación de Punto de Vista (POV) y elenco de personajes presentes.
  - Vinculación con eventos históricos y lugares del Códice.
  - Metas individuales de palabras por escena con seguimiento visual y tiempo de lectura estimado.

- **Códice & Worldbuilding**:
  - Enciclopedia categorizada: Personajes, Lugares, Facciones, Objetos, Conceptos/Magia y Eventos Históricos.
  - Dossier completo con atributos dinámicos (plantillas predefinidas y campos libres), resúmenes y notas.
  - Galería de imágenes local por entidad con visor a pantalla completa (*Lightbox*).
  - Alias y apodos con contador automatizado de menciones en los archivos `.md` del manuscrito.
  - Pizarra visual propia e independiente para cada ficha del Códice.

- **Mapa Visual de Relaciones**:
  - Grafo interactivo nodal de conexiones entre personajes y facciones.
  - Tipología amplia de vínculos (alianza, enemistad, familia, romance, mentoría, rivalidad, deuda, etc.) y valencia emocional.
  - Curvas Bezier con puntos de control manuales para evitar superposiciones.

- **Herramientas de Planificación**:
  - **Línea Temporal (Timeline)**: Cronología multilínea con pistas paralelas (Trama Principal, Subtramas, Lore/Pasado), eventos con niveles de importancia (menor, clave, giro, clímax) y enlace directo a escenas del manuscrito.
  - **Tablón de Corcho (Corkboard)**: Tarjetas de indexación visual por capítulo y acto con sinopsis y badges de estado (Idea, Borrador, Revisión, Pulido, Final).
  - **Arcos Narrativos (Story Beats)**: Estructuras clásicas (Tres Actos, Save the Cat!, El Viaje del Héroe) con porcentajes teóricos de avance y vinculación de escenas.
  - **Matriz de Estructura (Outline Grid)**: Vista panorámica tabular de actos, capítulos, objetivos narrativos y personajes participantes.

- **Pizarras Visuales (Moodboards)**:
  - Lienzo infinito con notas adhesivas, bloques de texto enriquecido con 10 fuentes literarias, formas geométricas y flechas conectoras direccionales.
  - Carga de imágenes locales, enlaces con reproductores embebidos (Spotify, YouTube) y visor integrado de documentos PDF locales.

- **Motor Editorial & Exportación**:
  - Previsualización en pliegos de dos páginas abiertas (*spreads*) simulando el libro impreso físico.
  - Exportación a documentos Microsoft Word (`.docx`) profesionales con plantillas tipográficas ajustables (Manuscrito Shunn, Novela Clásica de Bolsillo en Garamond, Literaria con Letra Capitular).
  - Exportación a archivo Markdown compilado (`.md`) y texto plano (`.txt`).

---

## Stack Tecnológico

- **Entorno de Escritorio**: [Electron](https://www.electronjs.org/) — Ejecución nativa multiplataforma (Linux, Windows, macOS) con acceso seguro al sistema de archivos local mediante IPC.
- **Frontend**:
  - [React 19](https://react.dev/) — Biblioteca de interfaces de usuario basada en componentes funcionales.
  - [TypeScript](https://www.typescriptlang.org/) — Tipado estático para robustez del modelo de datos narrativo.
  - [Vite](https://vitejs.dev/) — Herramienta de compilación rápida y servidor de desarrollo.
  - [Tailwind CSS v4](https://tailwindcss.com/) — Estilos utilitarios y temas visuales personalizables.
  - [Motion](https://motion.dev/) — Transiciones y animaciones fluidas.
  - [Lucide React](https://lucide.dev/) — Iconografía coherente.
- **Estado Local**: [Zustand](https://zustand-demo.pmnd.rs/) — Gestión reactiva y modular del estado con guardado granular desacoplado.
- **Documentos & Medios**:
  - [docx](https://docx.js.org/) — Generación de archivos Microsoft Word maquetados.
  - [pdfjs-dist](https://mozilla.github.io/pdf.js/) — Procesamiento y lectura de archivos PDF locales.

---

## Estructura del Proyecto

```text
novelore/
├── AGENTS.md                 # Restricciones arquitectónicas y reglas de desarrollo
├── docs/                     # Documentación técnica, arquitectura y roadmap
│   ├── architecture.md       # Arquitectura detallada del sistema local-first
│   └── roadmap.md            # Plan de desarrollo modular por fases
├── package.json              # Dependencias y scripts
├── index.html                # Entrada HTML principal de Vite
├── src/
│   ├── main.tsx              # Punto de entrada de React
│   ├── App.tsx               # Orquestación de vistas principales
│   ├── types.ts              # Tipos y modelos del dominio narrativo
│   ├── components/
│   │   ├── editor/           # Editor de manuscrito, barra lateral e inspector
│   │   ├── codex/            # Códice del mundo, dossiers y mapa de relaciones
│   │   ├── planning/         # Línea temporal, corcho, arcos narrativos y matriz
│   │   ├── board/            # Pizarra visual infinita y recursos multimedia
│   │   ├── export/           # Vistas de previsualización de libro y exportación
│   │   └── project/          # Portada de novela, metas de palabras y versiones
│   └── utils/                # Utilidades de formateo RAE, exportador DOCX y fuentes
```

---

## Ejecución en Local

### 1. Requisitos Previos
- Node.js (versión 20 o superior recomendada) o Bun.

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Desarrollo
Para iniciar la interfaz de desarrollo en local:
```bash
npm run dev
```

---

## Documentación Técnica

- [Directrices de Desarrollo y Restricciones (AGENTS.md)](AGENTS.md)
- [Arquitectura del Sistema (Local-First)](docs/architecture.md)
- [Roadmap Técnico Modular por Fases](docs/roadmap.md)
